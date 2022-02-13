import irc from 'irc';
import Redis from "ioredis";

const config = {
  IRC_SERVER: process.env.IRC_SERVER,
  IRC_CHANNEL: process.env.IRC_CHANNEL,
  IRC_NICK: process.env.IRC_NICK,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PASS: process.env.REDIS_PASS,
  REDIS_CHANNEL: process.env.REDIS_CHANNEL
};

const redisConfig = { host: config.REDIS_HOST, password: config.REDIS_PASS };
const sub = new Redis(redisConfig);
const pub = new Redis(redisConfig);

const client = new irc.Client(config.IRC_SERVER, config.IRC_NICK, {
  channels: [config.IRC_CHANNEL],
});

client.addListener('message', (from, to, message) => {
  pub.publish(config.REDIS_CHANNEL, JSON.stringify({
    from: from,
    to: to,
    message: message
  }));
  console.log(`Pub ${message}`);

  if (message.indexOf('.node') !== -1) {
    client.say(config.IRC_CHANNEL, `${config.IRC_NICK} was here at ${Date.now}`);
  }
})

client.addListener('error', (message) => {
  console.log('error: ', message);
});

client.addListener('raw', (raw) => {
  console.log("raw %o", raw);
});

const parse = (msg) => {
  try {
    return JSON.parse(msg);
  } catch (e) {
    console.log(`Invalid redis message ${msg}`);
  }
  return false;
}

sub.subscribe(config.REDIS_CHANNEL, (err, count) => {
  // TODO err
  sub.on('message', (ch, msg) => {
    console.log(`Received ${msg} from ${ch}`);
    let data = parse(msg);
    if (!data || !data.command) return;

    switch (data.command) {
      case 'say':
        if (data.to && data.message)
          client.say(data.to, data.message);
        break;
    }
  })
});