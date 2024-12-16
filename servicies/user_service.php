<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
include_once("../obj/User.php");
include_once("../obj/Token.php");
require '../vendor/autoload.php';

$method = $_SERVER['REQUEST_METHOD'];



if ($method == "OPTIONS") {
    http_response_code(200);
    exit();
}



if($method == "GET"){
    if(isset($_GET['email']) ){



        $headers = apache_request_headers();


        if (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
            
            if (strpos($authHeader, 'Bearer ') === 0) {
                $jwt = substr($authHeader, 7);
            
                $isVerify = $token->verifyToken($jwt);

                if (!$isVerify) {
                    http_response_code(200);  
                    echo json_encode(["message" => "Unauthorized" ]);
                    exit();
                }
            }
        }else{
            http_response_code(200);  
            echo json_encode(["message" => "Unauthorized" ]);
            exit();
        }

        $user->email = $_GET['email'];

        $stmt = $user->getUsers();

        $users_arr = array();
        $users_arr["message"] = "success";
        $users_arr["records"] = array();
       

        if($stmt["success"]){
            while ($row = $stmt["users"]->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
    
                $user = array(
                    "id" => $id,
                    "name" => $name,
                    "picture" => $picture,
                    "email" => $email,
                );
        
                array_push($users_arr["records"], $user);
            }
    
    
    
        
        
            http_response_code(200);
            echo json_encode($users_arr);
        }

              
    }else{
        http_response_code(400);
        echo json_encode(array("message" => "Cannot getUsers, there is not enough data."));

    }
}
else if($method == "POST"){
    $input = json_decode(file_get_contents("php://input"));
    
    if(isset($input->method) ){
        if($input->method == "refreshUserAuth"){
            
            $headers = apache_request_headers();


            if (isset($headers['authorization'])) {
                $authHeader = $headers['authorization'];
                
                if (strpos($authHeader, 'Bearer ') === 0) {
                    $jwt = substr($authHeader, 7);
                
                    $isVerify = $token->verifyToken($jwt);

                    if (!$isVerify) {
                        http_response_code(200);  
                        echo json_encode(["message" => "Unauthorized" ]);
                        exit();
                    }
                    $userId = $isVerify["id"];
                    $getUserByIdResult = $user->getUserById($userId);
                    if ($getUserByIdResult["success"] ) {
                        http_response_code(201);
                        echo json_encode(array("message" => "User was signed in","user"=> $getUserByIdResult["user"]));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("message" =>  $getUserByIdResult["message"]));
                    }
    
                }
            }else{
                http_response_code(200);  
                echo json_encode(["message" => "Unauthorized" ]);
                exit();
            }
        }else if(isset($input->params)){
            $params = $input->params;

            if( $input->method == "signIn"){

                if($params->method == "credentials"){
    
                    if ( !empty($params->email) && !empty($params->password)) {
                        $user->email = $params->email;
                        $user->password = $params->password;
                        $signInRes = $user->signIn();
                        if ($signInRes["success"]) {
    
                            http_response_code(201);
                            echo json_encode(array("message" => "User was signed in","user"=> $signInRes["user"], "token"=>$signInRes["token"]));
                        } else {
                            http_response_code(503);
                            echo json_encode(array("message" =>$signInRes["message"]));
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(array("message" => "Cannot sign in for this user, there is not enough data."));
                    }
                }else if($params->method == "google"){
                    // GOOGLE 
             
    
                    if (!empty($params->gToken)) {
                        $gToken = $params->gToken;
                        $client = new Google_Client(['client_id' => '189749029730-9cibjpcn5issuvuveg8gh83p0pj35f53.apps.googleusercontent.com']);   
                        $payload = $client->verifyIdToken($gToken);
    
                        if ($payload) {
                            $googleId = $payload['sub'];    
                            $email = $payload['email'];     
                            $name = $payload['name'];      
                            $picture = $payload['picture'];     
                                    
    
                            
                            $user->email = $email;
                            $user->name = $name;
                            $user->picture = $picture;
    
                            $user->password = $googleId;
                            $user->google_id = $googleId;
    
                            $googleAuthRes = $user->googleAuth();
    
                            if ($googleAuthRes["success"]) {
                                http_response_code(201);
    
                                echo json_encode(array("message" => "User was signed in", "user"=> $googleAuthRes["user"], "token" => $googleAuthRes["token"]));
                            }
                        } else {
                            http_response_code(503);
    
                            echo json_encode(['message' => 'Invalid token']);
                        }
     
    
               
                    } else {
                        http_response_code(400);
                        echo json_encode(array("message" => "Cannot sign in for this user, there is not enough data."));
                    }
    
     
                }
               
    
            }else if( $input->method == "signUp"){
    
                if (!empty($params->name) && !empty($params->email) && !empty($params->password)) {
                    $user->email = $params->email;
                    $user->password = $params->password;
                    $user->name = $params->name;
                    $signUpResult = $user->signUp();
                    if ($signUpResult["success"] && $signUpResult["token"]) {
                        http_response_code(201);
                        echo json_encode(array("message" => "User was signed up","user"=> $signUpResult["user"], "token"=>$signUpResult["token"]));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("message" =>  $signUpResult["message"]));
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "Cannot create a user, there is not enough data."));
                }
        
    
            }else if( $input->method == "editUser"){
                
                $headers = apache_request_headers();
    
    
                if (isset($headers['authorization'])) {
                    $authHeader = $headers['authorization'];
                    
                    if (strpos($authHeader, 'Bearer ') === 0) {
                        $jwt = substr($authHeader, 7);
                    
                        $isVerify = $token->verifyToken($jwt);
    
                        if (!$isVerify) {
                            http_response_code(200);  
                            echo json_encode(["message" => "Unauthorized" ]);
                            exit();
                        }
                    }
                }else{
                    http_response_code(200);  
                    echo json_encode(["message" => "Unauthorized" ]);
                    exit();
                }
                if (!empty($params->profile) && (property_exists($params->profile, 'picture') || !empty($params->profile->name))) {
    
        
                    $id = $params->profile->id;
                    $name = isset($params->profile->name) ? $params->profile->name : false;
                    $picture = property_exists($params->profile, 'picture') ? $params->profile->picture : false;
    
    
                    $editUserResult = $user->editUser($name, $picture, $id);
    
    
                    
                    if ($editUserResult["success"] ) {
                        http_response_code(201);
                        echo json_encode(array("message" => "User was edited","user"=> $editUserResult["user"]));
                    } else {
                        http_response_code(503);
                        echo json_encode(array("message" =>  $editUserResult["message"]));
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "Cannot edit user, there is not enough data."));
                }
        
    
            }
        } 
    } else
     {
        echo json_encode(array("message" => "No valid method specified."));
    }
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Method is not allowed."));
}
