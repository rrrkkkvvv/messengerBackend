<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
require '../vendor/autoload.php';

include_once("../obj/Message.php");
include_once("../obj/User.php");
include_once("../obj/Token.php");
include_once("../obj/Conversation.php");

class Conversation_service implements MessageComponentInterface {
    protected $clients;

    public function __construct($message, $conversation,$token) {
        $this->clients = new \SplObjectStorage;
        $this->message = $message;
        $this->conversation = $conversation;
        $this->token = $token;

    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn, ['conversationId' => null]);
        echo "New connection! ({$conn->resourceId})\n";
        
        $queryParams = $conn->httpRequest->getUri()->getQuery();
        parse_str($queryParams, $queryArray);

        if (!isset($queryArray['token'])) {
            $conn->send(json_encode(['message' => 'Unauthorized']));
            $conn->close();
            return;
        }
        $isVerified = $this->token->verifyToken($queryArray['token']);
        if (!$isVerified) {
            $conn->send(json_encode(['message' => 'Unauthorized']));
            $conn->close();
            return;
        }
        if (isset($queryArray['member_ids']) ) {
            $member_ids = json_decode($queryArray['member_ids']);
            if (is_array($member_ids)) {
                $conversationCreatingRes = $this->conversation->createConversation($member_ids);
        
                if ($conversationCreatingRes && $conversationCreatingRes["success"] && $conversationCreatingRes["conversation_id"]) {
                    $conversationId = $conversationCreatingRes["conversation_id"];
                    $members = $conversationCreatingRes["members"];
                    $messages = $conversationCreatingRes["messages"];
        
                    $this->clients->attach($conn, ['conversationId' => $conversationId]);

         
                    
                    $conn->send(json_encode([
                        "message" => "Conversation is created/already exists",
                        "messages" => $messages,
                        "members" => $members,
                        "conversationId" => $conversationId,
                    ]));
                }
                
            }else{
                echo  "member_ids isnt  an array type";
            }
        }else{
            echo  "member_ids isnt set";
         }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        if (!isset($data['token'])) {
            $from->send(json_encode(['message' => 'Unauthorized']));
            $from->close();
            return;
        }
        $isVerified = $this->token->verifyToken($data['token']);
        if (!$isVerified) {
            $from->send(json_encode(['message' => 'Unauthorized']));
            $from->close();
            return;
        }
        $clientData = $this->clients[$from];
        if (isset($data['conversationId'])) {
            $this->clients->attach($from, ['conversationId' => $data['conversationId']]);
        }else{
            echo "conversationId isnt setted";
            return;
        }
    
        if (!isset($clientData['conversationId'])) {
            $from->close();
            return;
        }
        if(isset($data["message"]["message_id"])){
            // edit message
            $message = $data["message"];
            $senderConversationId = $clientData['conversationId'];

            $editMessageResult = $this->message->editMessage($message, $senderConversationId);
            foreach ($this->clients as $client) {

                if ($this->clients[$client]['conversationId'] == $senderConversationId) {
          

                    if ($editMessageResult['success']) {
                        $messagesFromConv = $this->message->getConversationMessages($senderConversationId);
                        if($messagesFromConv){
                            
                            $client->send(json_encode(["message"=>"Update","messages"=>$messagesFromConv]));
                        }
                    }
                }
            }
        }else if(isset($data["messageId"])){
            // delete message
            $messageId = $data["messageId"];
            $senderConversationId = $clientData['conversationId'];

            $deleteMessageResult = $this->message->deleteMessage($messageId, $senderConversationId);
           
            foreach ($this->clients as $client) {

                if ($this->clients[$client]['conversationId'] == $senderConversationId) {
          

                    if ($deleteMessageResult['success']) {
                        $messagesFromConv = $this->message->getConversationMessages($senderConversationId);
                        if($messagesFromConv){
                            
                            $client->send(json_encode(["message"=>"Update","messages"=>$messagesFromConv]));
                        }
                    }
                }
            }
        }else if(isset($data["message"])){
            // send message
            $senderConversationId = $clientData['conversationId'];
            $messageText = $data['message']['message_text'];
            $messageImage = $data['message']['message_image'];
            $senderId = $data['message']['sender_id'];
            
            
            $createMessResult = $this->message->createMessage($messageText, $messageImage, $senderId, $senderConversationId);
            foreach ($this->clients as $client) {

                if ($this->clients[$client]['conversationId'] == $senderConversationId) {
          

                    if ($createMessResult['success']) {
                        $messagesFromConv = $this->message->getConversationMessages($senderConversationId);
                        if($messagesFromConv){
                            
                            $client->send(json_encode(["message"=>"Update","messages"=>$messagesFromConv]));
                        }
                    }
                }
            }
        }else if(isset($data["conversationUpdate"]) ){
            // delete conversation
            if($data["conversationUpdate"] == "delete" && isset($data["conversationId"])){
                $deletedConversationId = $data["conversationId"];

                $deleteConversationResult = $this->conversation->deleteConversation($deletedConversationId);

                

                foreach ($this->clients as $client) {
                    if ($this->clients[$client]['conversationId'] == $deletedConversationId) {
                        
                        if ($deleteConversationResult['success']) {
                                
                            $client->send(json_encode(["message"=>"Conversation was deleted", "conversationId" => $deletedConversationId]));
                         
                        }
                    }
                }


            }
        }
    }
    

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
    }

$server = Ratchet\Server\IoServer::factory(
    new Ratchet\Http\HttpServer(
        new Ratchet\WebSocket\WsServer(
            new Conversation_service($message, $conversation, $token)
        )
    ),
    8080
);

$server->run();
