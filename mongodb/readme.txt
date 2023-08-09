//in case mongodb is failing due to incorrect image references

docker-compose down
docker ps --all
docker images
docker rmi <image_name> //run for all listed images

docker-compose up --build