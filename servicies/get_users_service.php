<?php
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
require '../vendor/autoload.php';

include_once("../obj/User.php");
include_once("../obj/Token.php");

class Users_service implements MessageComponentInterface {
    protected $clients;

    public function __construct($user, $token) {
        $this->clients = new \SplObjectStorage;
        $this->user = $user;
        $this->token = $token;

    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn, ['userOnlineEmail' => null]);

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

        if (isset($queryArray['userEmail']) ) {
            $user_email = $queryArray['userEmail'];
            
            $getUsersRes = $this->user->getUsers($user_email);
    
    
            if ($getUsersRes && $getUsersRes["success"] && $getUsersRes["users"]) {
                $users = $getUsersRes["users"];
                $usersOnline = [];
                array_push($usersOnline, $user_email);

                foreach ($this->clients as $client) {
                    array_push($usersOnline, $this->clients[$client]['userOnlineEmail']);
                }

                $this->clients->attach($conn, ['userOnlineEmail' => $user_email]);

                $conn->send(json_encode([
                    "message" => "Success get users",
                    "users" => $users,
                    "usersOnline" => $usersOnline,
                ]));
      
                
                foreach ($this->clients as $client) {

                    
                    $getUsersRes = $this->user->getUsers($this->clients[$client]['userOnlineEmail']);
                    if ($getUsersRes && $getUsersRes["success"] && $getUsersRes["users"]) {
                        $users =  $getUsersRes["users"];
                        $client->send(json_encode([
                            "message" => "Success get users",
                            "users" => $users,
                            "usersOnline" => $usersOnline,
                        ]));
                        
                    }
                    
                }
            }
                
        }else{
            echo  "userEmail isnt set";
         }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
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
            new Users_service($user, $token)
        )
    ),
    8081
);

$server->run();
