<?php
include_once("../db/db.php");
include_once("Token.php");

class User {
    private $conn;
    private $table_name = "Users";

    public $users_id;
    public $name;
    public $email;
    public $password;
    public $google_id;

    public $picture;

    public function __construct($db) {
        $this->conn = $db;
        $this->token = new Token(); 

    }
    
    function findByGoogleId() {
        $sql = "SELECT * FROM ".$this->table_name." WHERE google_id = :google_id LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':google_id', $this->google_id);
        $stmt->execute();
                  
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if($row){
            return $row;
        }else{
            return [];
        }
    }

    function getUser(){

        $sql = "SELECT * FROM " . $this->table_name . " WHERE email = :email";

        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);

            $stmt->execute();

            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row){
                return ["success" => true, "user" => $row];
            }else{
                return ["success" => false, "message" => "Fetching error"];
            }

        } else {
            return ["success" => false, "message" => "Error preparing request: " . $this->conn->error];
        }
    }

    function getUserById($users_id){

        $sql = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        
        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':id', $users_id, PDO::PARAM_INT);

            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if($row){
                return ["success" => true, "user" => $row];
            }else{
                return ["success" => false, "message" => "Fetching error"];
            }
        
        } else {
            return ["success" => false, "message" => "Error preparing request: " . $this->conn->error];
        }
    }

    function signIn() {

        $currUserRes = $this->getUser();

        if (!$currUserRes["success"]) {
            return ["success" => false, "message"=>"Account does not exists"];

        } else if (!password_verify($this->password, $currUserRes["user"]['password'])){
            return ["success" => false, "message"=>"Password is wrong"];

        }else{
            $jwt = $this->token->createToken($currUserRes["user"]["id"]); 

            return ["success" => true,"user"=> $currUserRes["user"], "token" => $jwt];
        }
    }


    function signUp() {

        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO " . $this->table_name . " (name, email, password, google_id) VALUES (:name, :email, :password, :google_id)";


        if ($stmt = $this->conn->prepare($sql)) {
            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);
            $stmt->bindParam(':name', $this->name, PDO::PARAM_STR);
            $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
            $stmt->bindParam(':google_id', $this->google_id, PDO::PARAM_STR);

            $exec =$stmt->execute();
            if ($exec) {
                $currUser = $this->getUser();
                if($currUser["success"]){
                    $jwt = $this->token->createToken($currUser["user"]["id"]); 

                    return ["success" => true,"user"=> $currUser["user"], "token" => $jwt];
                }else{
                    return ["success" => false, "message"=>"Cannot create user"];
                }
          
            } else {
                return ["success" => false, "message"=>"Cannot create user"];
            }
        } else {
            return ["success" => false, "message"=>"Cannot create user"];
        }
    }


    function googleAuth() {
        $currUser = $this->findByGoogleId();

        if ($currUser) {
            $this->users_id = $currUser["id"];
            
            $jwt = $this->token->createToken($currUser["id"]); 
            if ($currUser) {
        
                return ["success" => true,"user"=> $currUser, "token" => $jwt, ];
            } else {
                
                return ["success" => false, "message"=>"User data is not correct"];

            }
        
        } else {
            return $this->signUp();
        }
    }

    function getUsers(){


        $sql = "SELECT * FROM " . $this->table_name . ' WHERE email != :email;';

        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':email', $this->email, PDO::PARAM_STR);

            $stmt->execute();

            return ["success" => true, "users"=>$stmt];

        }else{
            return ["success" => false, "message" => "Error preparing request: " . $this->conn->error];
        }
    
    }


    function editUser($name, $picture, $id){

        $sql = "";
        if($name  && ($picture || $picture === null)){
            $sql = "UPDATE " . $this->table_name . " SET  name = :name, picture = :picture WHERE id = :id";
        }else if($name && !$picture){
            $sql = "UPDATE " . $this->table_name . " SET  name = :name WHERE id = :id";
        }else if(!$name && ($picture || $picture === null)){
            $sql = "UPDATE " . $this->table_name . " SET  picture = :picture WHERE id = :id";
        }else{
            return ["success" => false, "message"=>"There is not enough data for edit user"];
        }
     

        if ($stmt = $this->conn->prepare($sql)) {
            if($name){
                $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            }

            if($picture || $picture === null){
                $stmt->bindParam(':picture', $picture, PDO::PARAM_STR);
            }
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);


            $exec = $stmt->execute();
            if ($exec) {
                
                $currUser = $this->getUserById($id);
                unset($currUser["user"]["password"]);

                if($currUser["success"]){

                    return ["success" => true,"user"=> $currUser["user"]];
                }else{
                    return ["success" => false, "message"=>"Cannot edit user"];
                }

            }else {
                return ["success" => false, "message"=>"Cannot edit user"];
            }
        }
    }


}
$user = new User($db);
