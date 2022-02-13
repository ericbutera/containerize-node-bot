# Containerize App
Learning more about containers.

```bash
docker-compose build
docker-compose up

redis-cli -a REDIS_PASS
PUBLISH infochannel "{\"to\":\"#infoforcefeed\",\"message\":\"hello!\",\"command\":\"say\"}"
```

# Goals
- simple node app
- redis hosted with app
- app able to talk to host irc server
