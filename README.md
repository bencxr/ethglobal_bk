# Banana Babies

Banana Babies is a web2 user friendly tamagotchi-style virtual pet game. You interact with your pet using rewards earned from depositing USDC in a Defi vault. While players earn interest, they also earn bananas in the game. Bananas are the in-game currency used to feed, upgrade and interact with your pet. 

We built this game to make children and adults want to save more - the more they save, the more they can do with their Banana Baby. Although it feels like a web2 game with Google login, every user has their own Web3Auth embedded wallet underneath. We built an integration with Coinbase USDC, the only onramp with zero fees, so users can start earning interest the second they join. 

Many mobile games are designed around mechanics of wait-to-win (energy runs out and recharges over time) or pay-to-win (buy gems to unlock equipment etc). That’s not cool, but with DeFi, we propose a new game mechanic: we call it save-2-win. 

## How it's made

Wallet: We used Web3Auth with Social login, which we felt matches the typical web2 sign up flow in a mobile app. We chose the non-mondal plug and play kit as we wanted to minimize dialogs and choices for the player. We added the native account abstraction provider and bundler/paymaster from pimlico sponsoring gas for gasless transactions, so that actions like adding USDC to a vault would not require base ETH tokens. 

Defi vault: When the player chooses to invest in the banana farm with gold coins, they’re really depositing/supplying the USDC into Aave. Banana rewards are calculated based on the interest/profit and are an integral part of the in-game economy which players will use to feed and play with their babies. 

Game Framework: Unity + WebGL. We chose this game framework as it is the most popular with game devs to grow the project with professional assets (we used public domain images based on the hackathon rules). While we could only use public static assets (typically we'd need to work with a designer to build animated elephants), Unity would allow us to quickly upgrade the animations and interactions in the future. 

Onramp: Coinbase Onramp. It was important to us to find an onramp with ZERO fees because when you teach children (or anyone) to save, they can't be losing 3% onboarding. After our exploration, the only onramp we could find that matched this for USDC was Coinbase. They support onramping less than $500 without a Coinbase account at a 1:1 USD conversion rate. TO implement the popup with minimal user disruption we used onchainkit but hid the fund button (we generate the click event when the user clicks the banana tree plus sign in game). 

Game State Store: Nillion. We store the game state (number of bananas) a blob on Nillion. We used the signature of a secret string as the user seed, so that the state can be cross device. 

Finally, all transactions happen on Base with USDC, because they are some of the cheapest and we felt would have the best support for the USDC ecosystem. 