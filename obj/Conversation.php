<?php
include_once("../db/db.php");
include_once("Token.php");
include_once("User.php");
include_once("Message.php");

class Conversation {
    private $conn;
    private $table_name = "conversations";
    private $conversation_users_table = "conversation_users";
    private $users_table = "users";





    public function __construct($db, $message, $user) {
        $this->conn = $db;
        $this->message = $message;
        $this->user = $user;
    }
    function getConversationMembers($member_ids){
        

        $members = array();

        foreach ($member_ids as $member_id ) {
        
            $member = $this->user->getUserById($member_id);
            if($member["success"]){
                array_push($members, $member["user"]);
            }
        }

        return $members;
    }
    function checkConversationExistence($member_ids) {
        $memberIdsString = implode(", ", $member_ids);
    
        $sql = "SELECT * FROM " . $this->conversation_users_table . "
                    WHERE member_id IN (" . $memberIdsString . ")
                    GROUP BY conversation_id
                    HAVING COUNT(DISTINCT member_id) = :members_count";
    
        if ($stmt = $this->conn->prepare($sql)) {
            $membersCount = count($member_ids);
    
            $stmt->bindParam(':members_count', $membersCount, PDO::PARAM_INT);
    
            if ($stmt->execute()) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($row) {
                    extract($row);
                    return ["success"=>true,"conversation_id"=>$conversation_id];
                } else {
                    return ["success"=>false];
                }
            }
        }
        return false; 
    }    
    
    function createConversation($member_ids) {
        $checkResult = $this->checkConversationExistence($member_ids);
    
        if (is_array($checkResult) && $checkResult["success"]) {
            $conversation_id = $checkResult["conversation_id"];
            $conversationMessages = $this->message->getConversationMessages($conversation_id);
            $members = $this->getConversationMembers($member_ids);
    
            if ($members) {
                return [
                    "success" => true,
                    "conversation_id" => $conversation_id,
                    "members" => $members,
                    "messages" => $conversationMessages
                ];
            } else {
                return ["success" => false, "message" => "Unable to retrieve members"];
            }
        } else {

            $sql = "INSERT INTO " . $this->table_name . "(title) VALUES('PLACEHOLDER_TITLE')";
            if ($stmt = $this->conn->prepare($sql)) {
                if ($stmt->execute()) {
                    $conversation_id = $this->conn->lastInsertId();
    
                    foreach ($member_ids as $member_id) {
                        $result = $this->addMemberIdToConversation($member_id, $conversation_id);
                        if (!$result["success"]) {
                            return $result; 
                        }
                    }
                    $conversationMessages = $this->message->getConversationMessages($conversation_id);
                    $members = $this->getConversationMembers($member_ids);
    
                    return [
                        "success" => true,
                        "conversation_id" => $conversation_id,
                        "members" => $members,
                        "messages" => $conversationMessages
                    ];
                } else {
                    return ["success" => false, "message" => "Executing command error"];
                }
            } else {
                echo json_encode(["success" => false, "message" => "Error preparing request: " . $this->conn->error]);
                return false;
            }
        }
    }
    function deleteConversation($conversation_id){
        $sql = "DELETE FROM ".$this->table_name." WHERE id = :conversation_id";
        
        if ($stmt = $this->conn->prepare($sql)) {
            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
            if($stmt->execute()){
            
           
                return ["success" => true];
            }else{
                return ["success" => false, "message" => "Executing command error"];
            }
        }else{
            echo json_encode(["success" => false, "message" => "Error preparing request: " . $this->conn->error]);
            return false;

        }


    }
    function addMemberIdToConversation($member_id, $conversation_id){
        $sql = "INSERT INTO ".$this->conversation_users_table." (conversation_id, member_id) VALUES(:conversation_id, :member_id)";
        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
            $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
            
            if($stmt->execute()){
           
                return ["success" => true];
            }else{
                return ["success" => false, "message" => "Executing command error"];
            }
        }else{
            echo json_encode(["success" => false, "message" => "Error preparing request: " . $this->conn->error]);
            return false;

        }
    }


}
$conversation = new Conversation($db, $message, $user);
