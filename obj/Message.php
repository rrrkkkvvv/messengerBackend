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
    
    function getMessageById( $conversation_id, $messageId){
        $sql = "SELECT messages.message_text AS `message_text`, messages.message_image AS `message_image`, messages.edited_at AS `edited_at`,  users.name  AS `sender_name`, users.id  AS `sender_id`, messages.sent_at AS `sent_at`, messages.id AS `message_id` FROM ". $this->table_name." JOIN users ON messages.sender_id = users.id WHERE messages.conversation_id = :conversation_id AND messages.id = :messageId ORDER BY messages.sent_at ASC";
        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
            $stmt->bindParam(':messageId', $messageId, PDO::PARAM_INT);

            $stmt->execute();

            
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if($rows){
                return ["success" => true, "messageById"=>$rows[0]];
            }else{
                return ["success" => false, ];
            }


         
        } else {
            echo json_encode(["success" => false, "message" => "Error preparing request: " . $this->conn->error]);
            return false;
        }
    }
    function createMessage($message_text, $message_image, $sender_id, $conversation_id) {


        $sql = "INSERT INTO " . $this->table_name . " (sender_id, conversation_id, message_text,message_image) VALUES (:sender_id, :conversation_id, :message_text, :message_image)";


        if ($stmt = $this->conn->prepare($sql)) {


            $stmt->bindParam(':sender_id', $sender_id, PDO::PARAM_INT);
            $stmt->bindParam(':conversation_id', $conversation_id, PDO::PARAM_INT);
            $stmt->bindParam(':message_text', $message_text, PDO::PARAM_STR);
            $stmt->bindParam(':message_image', $message_image, PDO::PARAM_STR);


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
    function deleteMessage($messageId, $conversation_id) {


        $sql = "DELETE FROM " . $this->table_name . " WHERE id = :messageId";


        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':messageId', $messageId, PDO::PARAM_INT);



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
    function editMessage($message, $conversation_id) {
        

        $sql = "UPDATE " . $this->table_name . " SET message_text = :message_text, message_image = :message_image, edited_at = NOW() WHERE id = :message_id";


        if ($stmt = $this->conn->prepare($sql)) {

            $stmt->bindParam(':message_image', $message["message_image"], PDO::PARAM_STR);
            $stmt->bindParam(':message_text', $message["message_text"], PDO::PARAM_STR);
            $stmt->bindParam(':message_id', $message["message_id"], PDO::PARAM_INT);



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
        $sql = "SELECT messages.message_text AS `message_text`, messages.message_image AS `message_image`, messages.edited_at AS `edited_at`,  users.name  AS `sender_name`, users.id  AS `sender_id`, messages.sent_at AS `sent_at`, messages.id AS `message_id` FROM ". $this->table_name." JOIN users ON messages.sender_id = users.id WHERE messages.conversation_id = :conversation_id ORDER BY messages.sent_at ASC";
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
