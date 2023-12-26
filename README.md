# Introduction

Aether is an open-source discord bot project created by `Darkgoatie#6381`. Aether provides features such as auctioning, vouch tracking, giveaways and manga new chapter tracking.

The auctioning, vouching and manga new chapter tracking are very unique features that you can rarely see! That is what makes Aether absolutely unique!

If you have any extra questions, suggestions, bug reports etc. Just head to the support server!

[Here](#available-commands) is a list of commands, you can see their subcommands by clicking on them. Have a great time while navigating through the documentation!

`Note for developers: The bot is developed in Discord.js v13, and is open to contributions! Feel free to inspect the code/contact me!`

## Available commands:

- [Help](#help)
- [Invite](#invite)
- [Auction](#auction)
- [Giveaway](#giveaway)
- [Vouch](#vouch)
- [Manga](#manga)

## Links

- ⭐ [Support Aether (Patreon)](https://patreon.com/Aether1611)
- [Discord Support Server](https://cdn.discordapp.com/avatars/805537268349665290/71fb39825db04396548d25d604a139bb.webp)
- [Github repository](https://github.com/darkgoatie/Aether-3)
- [Bot Invite Link](https://discord.com/oauth2/authorize?client_id=%20805537268349665290&permissions=8&scope=bot%20applications.commands)

## Help

Pretty simple command. It gives you a list of usable commands and brief descriptions to them. Though not as detailed as this documentation.

```js
/help
```

## Invite

Gives you two links, one that will lead you to the support server and a second one that'll give you an invite link for the bot which allows you to add it to your own server.

```js
/invite
```

## Auction

Auctioning with Aether is simpler than ever. Read down below for more information. I tried to put the examples as understandable as possible.

We have 5 available total auction subcommands:

- `/auction`
  - [`start`](#auction-start) - Start an auction
  - [`end`](#auction-end) - End an auction
  - [`bid`](#auction-bid) - Create a bid to an active auction
  - [`autoend`](#auction-autoend) - Set a timer to automatically end auction
  - [`setprice`](#auction-setprice) - Modify the price of the active auction

### Auction start

`/auction start` requires two arguments, and one optional argument. Which are:

Parameters:

- `startingprice`: The starting price that you are setting to the auction.
- `item`: The item that you're auctioning.
- `channel`?: The channel you are starting the auction in. If left blank, the auction will be started in the current channel. (Optional)

```js
// Example command for starting an auction for the item "Tomato" with the price of 1000.
/auction start startingprice:1000 item:Tomato
```

For bigger numbers, here's an easier workaround to typing six zeroes:

```js
// Starting an auction for "Potato" with the price of 3.000.000
// Way 1:
/auction start startingprice:3000000 item:Potato

// Way 2:
/auction start startingprice:3e6 item:Potato
```

The channel option, which is not required, can be used to start an auction in another channel.

```js
/auction start channel:#auctions startingprice:1000 item:Pickaxe
```

This will start an auction in channel `#auctions` for `Diamond Pickaxe` with the starting price of `1000`.

### Auction end

Ends an active auction in given channel. The channel parameter is optional, and will cast the command for current channel if there is no channel given.

Parameters:

- `channel`?: The channel you'd like to end auction.

**Example 1**: Ending an active auction in this channel

```js
/auction end
```

**Example 2**: Ending an auction of another channel

```js
/auction end channel:#public-auctions
```

This will end the auction that is active in the channel `#public-auctions`.

After an auction has ended, the auction winner will be sent a message, telling them that the auction has ended. This prevents long-term auctions from being forgotten, and makes it much easier for the auction winner to get informed. <br/>

Example auction ended notification (Sent to Winner):
<img src="https://media.discordapp.net/attachments/806227737244073994/1189204797031727165/Screen_Shot_2023-12-26_at_16.54.56.png?ex=659d5045&is=658adb45&hm=e0b6626151615c2675944f3379867312ad9329729a9782fd608d7167aa5c50f5&=&format=webp&quality=lossless&width=1920&height=372" width="80%"/>

### Auction bid

This is for bidding on an auction. This requires an active giveaway in the current channel. If there's no active auction in the current channel, you'll receive an error message.

Auction bid requires a single argument, which is:

- `amount` (Integer): The amount you are bidding on the auction.

**Example bidding scenario** on an auction:

An auction for Trophy with the startingprice of 1000 has started

```js
Darkgoatie: /auction start startingprice:1000 item:Trophy
```

This will <span style="color:red">error</span> and the bid won't count since the amount is lower than the starting price.

```
James: /auction bid amount:800
```

This will be a <span style="color:lightgreen">successful</span> bid, since the amount is higher than the current highest bid, and the starting price.

```
Tony: /auction bid amount:1200
```

### Auction autoend

Sets a timer to automatically end the auction.
e.g.: Let's say you want an auction to end in three days and don't want to manually do it. You can set up an auction end timer, so aether will automatically end the auction in the given time!

**Example**: This command will automatically end the auction of current channel in 3 days.

Parameters:

- `time`: The time you'd like to set the timer for.

```js
/auction autoend time:3d
```

### Auction setprice

Sets the price of an auction. May be used for typos, troll-bidders etc.

Parameters:

- `amount`: The new price that shall be set.

**Example:** This will change the auction's current bid to 1230.

```js
/auction setprice amount:1230
```

## Giveaway

Giveaway commands are easy to comprehend, however aether adds extra functionality to them. We have 5 total giveaway subcommands. These are

- `/giveaway`
  - [`start`](#giveaway-start)
  - [`end`](#giveaway-end)
  - [`reroll`](#giveaway-reroll)
  - [`setemoji`](#giveaway-setemoji)

After a giveaway has been started, the people willing to participate shall react on the giveaway emoji to join it. The giveaway emoji is a gift emoji by default, however it can be modified through `/giveaway setemoji`.

### Giveaway start

Simply starts a giveaway.

Parameters:

- `time`: The time the giveaway should end in.
- `prize`: The prize the winner(s) will get.
- `winners`?: The amount of winners that shall be chosen. Default: 1
- `channel`?: A channel to start the giveaway in.
- `mention`?: A role to mention after the giveaway is started.

### Giveaway end

Simply ends a giveaway before waiting for the giveaway timer. (If you'd like to re-choose winner instead, head to [`/giveaway reroll`](#giveaway-reroll))

Parameters:

- `id`: The Message ID of the giveaway.

**Example:**

### Giveaway reroll

After a giveaway has ended and you'd like to choose another winner, you can use this. The giveaway reroll command expects a giveaway id, which is the same as the message id.

Parameters:

- `id`: The Message ID of the giveaway.

**Example:** Reroll the giveaway with the id `123123123`.

```js
/giveaway reroll id:123123123
```

### Giveaway setemoji

This sets the default guild giveaway emoji.

Parameters:

- `emoji`: The name of the emoji you'd like to set.

**Example usage:** Set the giveaway emoji to the emoji with the name of `CoolEmoji`.

```js
/giveaway setemoji emoji:CoolEmoji
```

<span style="color:red">Note:</span> this emoji has to be a custom emoji, it does not accept default global emojis that discord supplies such as :gift: etc.

## Vouch

Vouches, simply explained are "trust points" given to you by other users. This helps finding reliable/experienced people to trade/interact with, and aims to prevent scammers. A default user starts with the vouch points of `0`, which can be increased through someone in the server vouching you. Vouches are tracked `locally`, which means they are not global and only for the current server.

### Vouch give

Gives a vouch, adding a point to their trust points. Parameters:

Parameters:

- `user`: The user you'd like to vouch.
- `reason`?: Provide a reason for your vouch.

### Vouch check

Checks someone's (or your own) vouches.

Parameters:

- `user`?: The user that you'd like to check vouches of. If left empty it will display your own vouches.

### Vouch set

This is an admin command. Sets the vouches of someone to a specific amount.

Parameters:

- `user`: The user you'd like to modify the vouches of.
- `amount`: New vouch count.
- `reason`?: The reason for your "set".

### Vouch config

Configures server vouch options.

Parameters:

- `logchannel`?: The vouch updates logging channel.
- `cooldown`?: The cooldown of how often a user can vouch someone.

## Manga

The manga feature allows you to search mangas, track them and get notified on new chapter releases! (Credits to Mangadex API)

### Small guide on tracking a manga:

1. Search a manga you'd like to track using `/manga search` with the manga name. Find your desired manga in the results.
2. Copy the ID of the manga.
3. Add the manga to your tracking list using `/manga track` with the manga ID you just copied.
   <br/>

Boom! Now you'll be notified (via DMs) when a new chapter of that series is published.<br/>
Example New chapter notification:
<img src="https://media.discordapp.net/attachments/806227737244073994/1189205083473334362/Screen_Shot_2023-12-26_at_16.55.44.png?ex=659d508a&is=658adb8a&hm=7ecc0fcb196fedbf8a5403de678cfb8c280cfa42c1665c5f53df2a069ba7413d&=&format=webp&quality=lossless&width=1920&height=730" width="80%"/>

<sup>Note: Not to create any confusion, Aether Legacy is the testing bot. Normally you'll be sent a dm by the original bot.</sup>

Available manga subcommands:

- `/manga`
  - [`trackinglist`](#manga-trackinglist)
  - [`track`](#manga-track)
  - [`untrack`](#manga-untrack)
  - [`search`](#manga-search)
  - [`latestchapter`](#manga-latestchapter)

### Manga trackinglist

Displays your current manga tracking list. You can track maximum **25** manga at a time.

Parameters:

- `displaydetails`?: Should details such as ids and author ids be displayed? Default: false

### Manga track

Adds a manga to your tracking list. Notifies you on chapter releases.

Parameters:

- `manga`: The Manga ID that you'd like to track.

### Manga untrack

Removes a manga from your tracking list.

Parameters:

- `manga`: The Manga ID that you'd like to remove from your tracking list.

### Manga search

Creates a search menu, showing up to 20 results and giving information about their description, ID etc.

Parameters:

- `title`: The Manga Title that you'd like to search for.

### Manga latestchapter

Checks the latest chapter of the manga.

Parameters:

- `manga`: The Manga ID that you'd like to track.

# Outro

Yeah so that was it. I didn't think anyone would make it to the end of the documentation! Crazy attention span! Now head to [LINKS](#links) and join the support server!
