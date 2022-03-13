# Aether
Aether is an open-source discord bot project created by Darkgoatie#6381. Aether provides features like auctioning, vouch tracking, giveaways etc. 


## Auctioning
Auctioning with Aether is simpler than ever. 
### Auction start
Auction start require two arguments, and one optional arguments. Which are:
- `startingprice` (Integer): The starting bid that you are setting to the auction.
- `item` (String): The item that you're auctioning.
- `channel` (GuildTextChannel, optional): The channel you are starting the auction in. If left blank, the auction will be started in the current channel.

This is how you can start a minimal auction with this command.
```js
/auction start startingprice:1000 item:Tomato 
```

For bigger numbers, here's an easier way:
```js
// Way 1:
/auction start startingprice:3000000 item:Potato

// Way 2:
/auction start startingprice:3e6 item:Potato
```
These two commands will result in same actions.

The channel option, which is not required, can be used to start an auction in another channel.
```js
/auction start channel:#auctions startingprice:1000 item:Diamond Pickaxe 
```
This will start an auction in channel `#auctions` for `Diamond Pickaxe` with the starting bid of `1000`.

### Auction bid
This is for bidding on an auction. This requires an active giveaway in the current channel. If there's no active auction in the current channel, you'll receive an error message.

Auction bid requires a single argument, which is:
- `amount` (Integer): The amount you are bidding on the auction.

Example bid on an auction:
```js
> Darkgoatie: /auction start startingprice:1000 item:Trophy
// An auction for Trophy with the startingprice of 1000 has started

> James: /auction bid amount:800
// This will error since the amount is lower than the starting price.

> Tony: /auction bid amount:1200
// This will be a successful bid, since the amount is higher than the highest bid, and the starting price.
```

### Auction end