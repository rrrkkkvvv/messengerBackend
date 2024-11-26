<?php
include_once("../db/db.php");
include_once("Token.php");

class Message {
    private $conn;
    private $table_name = "messages";
    private $conversation_users_table = "conversation_users";
    private $conversation_table = "conversations";
 



    public function __construct($db) {
        $this->conn = $db;
    }
    
 
    function createMessage($message_text, $sender_id, $conversation_id) {


        $sql = "INSERT INTO " . $this->table_name . " (sender_id, conversation_id, message_text) VALUES (:sender_id, :conversation_id, :message_text)";


        if ($stmt = $this->conn->prepare($sql)) {


            $stmt->bindParam(':sender_id', $sender_id, PDO::PARAM_INT);
            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
            $stmt->bindParam(':message_text', $message_text, PDO::PARAM_STR);


            if ($stmt->execute()) {
                $conversationMessages = $this->getConversationMessages($conversation_id);
                if($conversationMessages){

                    
                    return ["success" => true,"messages"=> $conversationMessages];
                }else{
                    echo "Error execution request: " . $this->conn->error;
                    return ["success" => false,"message"=> "Cannot get messages from conversation"];
                }
          
            } else {
                echo "Error execution request: " . $this->conn->error;
                return ["success" => false,"message"=> "Error execution request"];
            }
        } else {
            echo "Error preparing request: " . $this->conn->error;
            return ["success" => false,"message"=> "Error preparing request"];
        }
    }

    function getConversationMessages($conversation_id){
        $sql = "SELECT messages.message_text AS `message_text`, users.name  AS `sender_name`, users.id  AS `sender_id`, messages.sent_at AS `sent_at`, messages.id AS `message_id` FROM ". $this->table_name." JOIN users ON messages.sender_id = users.id WHERE messages.conversation_id = :conversation_id ORDER BY messages.sent_at ASC";
        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);

            $stmt->execute();

            
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if($rows){
                return $rows;
            }else{
                return [];
            }


         
        } else {
            echo json_encode(["success" => false, "message" => "Error preparing request: " . $this->conn->error]);
            return false;
        }
    }

}
$message = new Message($db);
