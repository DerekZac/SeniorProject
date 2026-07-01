export type GuideCategory = 'fundamentals' | 'wallets' | 'defi' | 'trading' | 'security';

export interface GuideSection {
  id: string;
  title: string;
  summary: string;
  content: string;
  readTime: string;
  category: GuideCategory;
  icon: string;
}

export const GUIDES: GuideSection[] = [
  {
    id: 'what-is-crypto',
    title: 'What is Cryptocurrency?',
    summary: 'Understand what crypto is, how it differs from traditional money, and why it exists.',
    content: `Cryptocurrency is a form of digital money that uses cryptography — mathematical codes — to secure transactions and control the creation of new units. Unlike dollars or euros, no government or central bank issues or controls it. Instead, it runs on a decentralized network of computers around the world.

Bitcoin, created in 2009 by the pseudonymous Satoshi Nakamoto, was the first cryptocurrency. Since then, thousands of others have been created — Ethereum, Solana, and XRP among the most prominent.

The core idea is simple: move value between people anywhere in the world without needing a bank as the middleman. A transaction from New York to Tokyo settles in minutes, not days, and usually costs cents regardless of the amount sent.

Cryptocurrencies are stored and transferred using digital wallets — software that holds your cryptographic keys. You don't technically hold the coins themselves; you hold the proof that the coins belong to you, recorded on the blockchain.

Not all cryptocurrencies are the same. Some are currencies (Bitcoin), some power smart contract platforms (Ethereum, Solana), some are privacy coins (Monero), and some are meme-inspired (Dogecoin). Understanding what each one is designed to do is crucial before investing.`,
    readTime: '4 min read',
    category: 'fundamentals',
    icon: 'Coins',
  },
  {
    id: 'how-blockchain-works',
    title: 'How Blockchain Works',
    summary: 'A distributed ledger that records every transaction — here is how the technology actually functions.',
    content: `A blockchain is a database that is shared and synchronized across thousands of computers simultaneously. Every transaction ever made is recorded in it, visible to anyone, and nearly impossible to alter or delete.

Think of it as a ledger book where every page (a "block") is filled with transaction records. Once a page is full, it is sealed with a unique code (called a hash) that includes a fingerprint of the previous page. This chains the pages together — hence "blockchain." Changing one record would break the chain at that point, and the network would immediately reject it.

New blocks are added through a process called consensus. In Bitcoin's case, this uses Proof of Work: computers (miners) compete to solve a complex mathematical puzzle. The winner adds the next block and earns newly created Bitcoin as a reward. This process is intentionally energy-intensive because it makes attack expensive.

Ethereum switched to Proof of Stake in 2022. Instead of miners, validators lock up ("stake") Ethereum as collateral to earn the right to add blocks. If they try to cheat, they lose their stake. This uses about 99.9% less energy than Proof of Work.

Smart contracts are programs stored on the blockchain that execute automatically when conditions are met — like a vending machine. You put in the right coins, the machine releases the product. No human needed. Ethereum pioneered smart contracts and they power everything from DeFi to NFTs.`,
    readTime: '6 min read',
    category: 'fundamentals',
    icon: 'Link',
  },
  {
    id: 'wallets-and-keys',
    title: 'Wallets & Private Keys',
    summary: 'Your wallet does not hold coins — it holds keys. Learn the difference between hot and cold storage.',
    content: `A crypto wallet does not store cryptocurrency the way a physical wallet holds cash. Your coins exist on the blockchain. What your wallet stores is a private key — a secret string of numbers and letters that proves you own specific coins and allows you to authorize transactions.

Every wallet has two keys: a public key (your "address" — like a bank account number you can share with anyone) and a private key (your secret — like your PIN, never share this). Anyone can send coins to your public address. Only the private key can move those coins out.

A seed phrase (also called a recovery phrase) is a human-readable backup of your private key — typically 12 or 24 words. If you lose your device, you can restore your wallet on any compatible software using these words. Write them down on paper. Store them in a safe place. Never photograph them or type them into any website.

Hot wallets are connected to the internet — mobile apps (Metamask, Trust Wallet) and desktop clients. They are convenient for daily use but more vulnerable to hacks since the keys are online.

Cold wallets (hardware wallets like Ledger and Trezor) store your private key on a physical device that never connects to the internet. When you sign a transaction, the key stays inside the device. Even if your computer is infected with malware, your coins are safe. For significant holdings, a hardware wallet is strongly recommended.

Custodial wallets (exchange accounts) mean the exchange holds your private keys on your behalf. "Not your keys, not your coins" is a common saying — if the exchange collapses or gets hacked, your funds may be at risk.`,
    readTime: '5 min read',
    category: 'wallets',
    icon: 'Wallet',
  },
  {
    id: 'defi-explained',
    title: 'DeFi Explained',
    summary: 'Decentralized finance removes banks from the equation. Learn about lending, staking, and liquidity pools.',
    content: `Decentralized Finance (DeFi) is the umbrella term for financial services built on blockchain networks — lending, borrowing, trading, and earning interest — without banks, brokers, or any company in the middle. Smart contracts replace the institution.

Decentralized exchanges (DEXs) like Uniswap let you trade tokens directly from your wallet, peer-to-peer, 24/7. There is no company holding your funds. Prices are set by an algorithm based on liquidity pools rather than an order book.

Liquidity pools are the fuel of DeFi. Users deposit pairs of tokens (e.g., ETH and USDC) into a smart contract. Traders use this pool to swap tokens and pay small fees. Those fees are distributed to the depositors (liquidity providers) as yield. This is how you earn passive income in DeFi.

Lending protocols like Aave and Compound let you deposit crypto as collateral and borrow other assets. Rates adjust algorithmically based on supply and demand. Because loans are over-collateralized (you borrow less than you put in), no credit check is needed.

Staking lets you lock up certain coins to help secure their network (Proof of Stake chains) and earn rewards. Ethereum staking yields around 4% annually. Some platforms offer liquid staking — you get a token representing your staked asset so you can still use it in DeFi while earning yield.

DeFi carries significant risks: smart contract bugs, rug pulls (developers abandoning projects with funds), liquidation risk, and extreme volatility. Never put in more than you can afford to lose, and always audit the project before depositing.`,
    readTime: '7 min read',
    category: 'defi',
    icon: 'Layers',
  },
  {
    id: 'nfts',
    title: 'NFTs & Digital Ownership',
    summary: 'Non-fungible tokens represent verifiable ownership of unique digital assets on the blockchain.',
    content: `An NFT (Non-Fungible Token) is a unique digital certificate stored on a blockchain that proves ownership of a specific item — an image, video, music file, game item, or any digital file. Unlike Bitcoin (where every coin is identical and interchangeable), each NFT is one-of-a-kind.

The key word is "non-fungible." A dollar bill is fungible — you can swap it for any other dollar bill and have the same thing. A signed painting is non-fungible — there is only one original. NFTs bring this concept to the digital world.

When you buy an NFT, you receive a token on the blockchain pointing to the asset. The blockchain records your ownership publicly and permanently. However, this does not always give you copyright of the underlying content — that depends on the specific agreement with the creator.

NFTs peaked in hype during 2021, when digital artworks sold for millions. The market has cooled significantly, but the technology continues to develop use cases beyond art: gaming (owning in-game items that persist across games), event tickets, membership passes, real estate deed records, and supply chain tracking.

The primary risk with NFTs is illiquidity and speculation. Most NFTs have thin markets and can be very difficult to sell. The value is largely driven by perceived cultural relevance and community — not underlying cashflow like a stock or bond. As with all crypto assets: research thoroughly and be prepared for high volatility.`,
    readTime: '5 min read',
    category: 'fundamentals',
    icon: 'Image',
  },
  {
    id: 'security-basics',
    title: 'Staying Safe in Crypto',
    summary: 'Scams, phishing, and rug pulls are rampant. Learn how to protect your assets.',
    content: `Crypto security is entirely your responsibility. There is no fraud department to call, no chargebacks, and no "forgot password" for your private keys. Once funds leave your wallet, they are almost certainly gone.

Phishing is the most common attack. Scammers create fake websites that look identical to real exchanges or wallets. You enter your seed phrase or password, and they drain your wallet. Always verify the URL carefully. Bookmark real sites and navigate from the bookmark. Never click links in emails or DMs.

Seed phrase security is paramount. Your 12–24 word recovery phrase is the master key to your wallet. Never type it into any website, app, or chat. Never photograph it. Never store it in cloud services (Google Drive, iCloud). Write it on paper and keep it in a secure, offline location. Consider a metal backup plate for fire and water resistance.

Smart contract risks: when you connect your wallet to a DeFi application and approve a transaction, you may be granting that contract permission to spend your tokens. Review what you are approving. Use tools like Revoke.cash to audit and revoke unnecessary approvals.

Common scams to avoid: "guaranteed returns" offers, celebrity giveaway scams (Elon is never giving away Bitcoin), fake customer support in Telegram/Discord asking for your seed phrase, "pig butchering" romance scams that slowly build trust before directing you to a fake investment platform, and pump-and-dump schemes on low-cap coins.

Use hardware wallets for large holdings, unique strong passwords on exchanges, enable 2FA with an authenticator app (not SMS), and keep software updated. The crypto space rewards the cautious and punishes the careless.`,
    readTime: '6 min read',
    category: 'security',
    icon: 'Shield',
  },
  {
    id: 'trading-basics',
    title: 'Crypto Trading Basics',
    summary: 'Spot, futures, limit orders, and dollar-cost averaging — a plain-English introduction to trading.',
    content: `Spot trading is the simplest form: you buy a crypto asset at the current market price and own it outright. When BTC is $60,000, you buy one Bitcoin and now own it. If it rises to $80,000, you profit. If it drops to $40,000, you lose.

Order types matter. A market order buys or sells immediately at the current price — fast but you accept whatever price the market offers. A limit order lets you specify the maximum price you will pay (or minimum you will accept to sell). Your order sits in the order book until the market reaches your price, or you cancel it. A stop-loss order automatically sells if price drops to a level you set — crucial for managing downside risk.

Dollar-Cost Averaging (DCA) is a strategy where you invest a fixed amount at regular intervals (e.g., $100 every week) regardless of price. During dips, your $100 buys more. During peaks, it buys less. Over time, this averages your cost basis and removes the stress of trying to time the market. Many long-term crypto investors use this approach.

Leverage trading lets you control a larger position with a smaller deposit. 10x leverage means $1,000 controls $10,000. Profits are amplified — but so are losses. A 10% adverse move wipes out 100% of your margin. Beginners should avoid leverage trading entirely.

Key metrics to watch: trading volume (higher volume = more liquid market), bid-ask spread (difference between buy and sell price), and 24h price change. Technical analysis tools like moving averages and RSI can help identify trends, but no indicator is reliable in isolation.

Always define your risk before entering a trade: how much are you willing to lose? Set a stop-loss. Never invest more than you can afford to lose entirely — crypto markets can and do drop 80%+ in bear markets.`,
    readTime: '8 min read',
    category: 'trading',
    icon: 'TrendingUp',
  },
  {
    id: 'tax-guide',
    title: 'Crypto Taxes Explained',
    summary: 'Most countries treat crypto as property. Understand taxable events before you trade.',
    content: `In most countries, cryptocurrency is treated as property for tax purposes — not currency. This means that nearly every time you sell, trade, or spend crypto, you create a taxable event that must be reported.

In the United States, the IRS requires you to report capital gains on every crypto transaction. If you bought Bitcoin at $30,000 and sold at $60,000, you owe capital gains tax on the $30,000 profit. Short-term gains (assets held under one year) are taxed as ordinary income — up to 37%. Long-term gains (held over one year) are taxed at lower preferential rates — 0%, 15%, or 20% depending on your income.

Taxable events include: selling crypto for fiat (dollars), trading one crypto for another (e.g., swapping BTC for ETH), using crypto to buy goods or services, and receiving staking or mining rewards (taxed as ordinary income at time of receipt).

Non-taxable events: buying and holding crypto, transferring between your own wallets, and receiving crypto as a gift (the giver may owe gift tax depending on amount).

Record keeping is critical. Track every transaction: date, amount, price at time of transaction, and fee paid. Most exchanges provide downloadable transaction history. Tax software like Koinly, CoinTracker, or TaxBit can automatically import your history from exchanges and calculate your gains and losses.

Outside the US, rules vary significantly. Germany taxes gains as income unless held for more than one year (then tax-free for individuals). The UK applies Capital Gains Tax at 10% or 20%. Singapore has no capital gains tax on crypto. Always consult a tax professional familiar with crypto in your jurisdiction.`,
    readTime: '6 min read',
    category: 'trading',
    icon: 'Receipt',
  },
];

export const CATEGORIES: { id: 'all' | GuideCategory; label: string }[] = [
  { id: 'all',          label: 'All Topics' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'wallets',      label: 'Wallets' },
  { id: 'defi',         label: 'DeFi' },
  { id: 'trading',      label: 'Trading' },
  { id: 'security',     label: 'Security' },
];
