<?php

namespace App;
class Router{
    protected $routes=[];
    public function add($method,$route,$handler)
    {
        $this->routes[]=[
            'method'=>$method,
            'route'=>$route,
            'handler'=>$handler,
        ];
    }
    public function run()
    {
        $uri = isset($_GET['route']) ? '/' . trim((string) $_GET['route'], '/') : parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // When installed below a project directory, route only the path after /public/.
        $publicPrefix = strpos($uri, '/public/');
        if ($publicPrefix !== false) {
            $uri = substr($uri, $publicPrefix + 7);
        }
        if ($uri === '' || $uri === false) {
            $uri = '/';
        }
        $method=$_SERVER['REQUEST_METHOD'];
        foreach($this->routes as $route)
            {
                $pattern=str_replace(['{id}','/'],['([0-9]+)','\/'],$route['route']);
                $pattern='/^'.$pattern.'$/';
                if($method===$route['method'] && preg_match($pattern,$uri,$matches))
                    { array_shift($matches);
                        list($controllerName,$methodName)=explode('@',$route['handler']);
                        $controller=new $controllerName();
                        return call_user_func_array([$controller,$methodName],$matches); 
                    }
            }
            //si no encontro
            http_response_code(404);
            echo json_encode(["error"=>'Ruta no encontrada']);
    }
}
