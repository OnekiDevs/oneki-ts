export interface UnoCard {
    id: string;
    url: string;
    symbol: string;
    color: string;
}

export function randomCard(): UnoCard { return UnoCards[Math.floor(Math.random() * UnoCards.length)] }

export const UnoCards: UnoCard[] = [
    {
        id: '0r',
        url: 'https://i.postimg.cc/LsyfsdLk/0-red.png', 
        color: 'red',
        symbol: '0'
    },
    {
        id: '1r',
        url: 'https://i.postimg.cc/8596hhyj/1-red.png', 
        color: 'red',
        symbol: '1'
    },
    {
        id: '2r',
        url: 'https://i.postimg.cc/WzZJShKS/2-red.png', 
        color: 'red',
        symbol: '2'
    },
    {
        id: '3r',
        url: 'https://i.postimg.cc/gcLRGTJR/3-red.png', 
        color: 'red',
        symbol: '3'
    },
    {
        id: '4r',
        url: 'https://i.postimg.cc/tC06JNZc/4-red.png', 
        color: 'red',
        symbol: '4'
    },
    {
        id: '5r',
        url: 'https://i.postimg.cc/jdz77nyS/5-red.png', 
        color: 'red',
        symbol: '5'
    },
    {
        id: '6r',
        url: 'https://i.postimg.cc/52bFq9mq/6-red.png', 
        color: 'red',
        symbol: '6'
    },
    {
        id: '7r',
        url: 'https://i.postimg.cc/2SGLHpcp/7-red.png', 
        color: 'red',
        symbol: '7'
    },
    {
        id: '8r',
        url: 'https://i.postimg.cc/jjjwm8mD/8-red.png', 
        color: 'red',
        symbol: '8'
    },
    {
        id: '9r',
        url: 'https://i.postimg.cc/d1k7thqv/9-red.png', 
        color: 'red',
        symbol: '9'
    },
    {
        id: '0g',
        url: 'https://i.postimg.cc/4NWRxBnv/0-green.png',
        color: 'green',
        symbol: '0'
    },
    {
        id: '1g',
        url: 'https://i.postimg.cc/RZq56Knk/1-green.png',
        color: 'green',
        symbol: '1'
    },
    {
        id: '2g',
        url: 'https://i.postimg.cc/x17rK8vc/2-green.png',
        color: 'green',
        symbol: '2'
    },
    {
        id: '3g',
        url: 'https://i.postimg.cc/ryCLv8kP/3-green.png',
        color: 'green',
        symbol: '3'
    },
    {
        id: '4g',
        url: 'https://i.postimg.cc/PrXkHBfr/4-green.png',
        color: 'green',
        symbol: '4'
    },
    {
        id: '5g',
        url: 'https://i.postimg.cc/KzSdHWsb/5-green.png',
        color: 'green',
        symbol: '5'
    },
    {
        id: '6g',
        url: 'https://i.postimg.cc/j2X0Nhcb/6-green.png',
        color: 'green',
        symbol: '6'
    },
    {
        id: '7g',
        url: 'https://i.postimg.cc/0NJTZvnZ/7-green.png',
        color: 'green',
        symbol: '7'
    },
    {
        id: '8g',
        url: 'https://i.postimg.cc/3N3zKvTb/8-green.png',
        color: 'green',
        symbol: '8'
    },
    {
        id: '9g',
        url: 'https://i.postimg.cc/dQ9z54RM/9-green.png',
        color: 'green',
        symbol: '9'
    },
    {
        id: '0y',
        url: 'https://i.postimg.cc/HWPfGjN3/0-yellow.png',
        color: 'yellow',
        symbol: '0'
    },
    {
        id: '1y',
        url: 'https://i.postimg.cc/jSy9JcSk/1-yellow.png',
        color: 'yellow',
        symbol: '1'
    },
    {
        id: '2y',
        url: 'https://i.postimg.cc/02Mh9PRv/2-yellow.png',
        color: 'yellow',
        symbol: '2'
    },
    {
        id: '3y',
        url: 'https://i.postimg.cc/jdpm5mt7/3-yellow.png',
        color: 'yellow',
        symbol: '3'
    },
    {
        id: '4y',
        url: 'https://i.postimg.cc/C1r6V6cd/4-yellow.png',
        color: 'yellow',
        symbol: '4'
    },
    {
        id: '5y',
        url: 'https://i.postimg.cc/q70FcKtB/5-yellow.png',
        color: 'yellow',
        symbol: '5'
    },
    {
        id: '6y',
        url: 'https://i.postimg.cc/502kTMqZ/6-yellow.png',
        color: 'yellow',
        symbol: '6'
    },
    {
        id: '7y',
        url: 'https://i.postimg.cc/mrw5mrMY/7-yellow.png',
        color: 'yellow',
        symbol: '7'
    },
    {
        id: '8y',
        url: 'https://i.postimg.cc/xj7Fxhk4/8-yellow.png',
        color: 'yellow',
        symbol: '8'
    },
    {
        id: '9y',
        url: 'https://i.postimg.cc/4N92rPVN/9-yellow.png',
        color: 'yellow',
        symbol: '9'
    },
    {
        id: '0b',
        url: 'https://i.postimg.cc/150WMtDv/0-Blue.png',
        color: 'blue',
        symbol: '0'
    },
    {
        id: '1b',
        url: 'https://i.postimg.cc/nzQ2mcHY/1-Blue.png',
        color: 'blue',
        symbol: '1'
    },
    {
        id: '2b',
        url: 'https://i.postimg.cc/C5TNsT5y/2-Blue.png',
        color: 'blue',
        symbol: '2'
    },
    {
        id: '3b',
        url: 'https://i.postimg.cc/9FgknjV6/3-Blue.png',
        color: 'blue',
        symbol: '3'
    },
    {
        id: '4b',
        url: 'https://i.postimg.cc/CK2JdfVx/4-Blue.png',
        color: 'blue',
        symbol: '4'
    },
    {
        id: '5b',
        url: 'https://i.postimg.cc/cLsFzSm0/5-Blue.png',
        color: 'blue',
        symbol: '5'
    },
    {
        id: '6b',
        url: 'https://i.postimg.cc/Z5VwtM73/6-Blue.png',
        color: 'blue',
        symbol: '6'
    },
    {
        id: '7b',
        url: 'https://i.postimg.cc/25y2z7Mt/7-Blue.png',
        color: 'blue',
        symbol: '7'
    },
    {
        id: '8b',
        url: 'https://i.postimg.cc/J0NQT6Hs/8-Blue.png',
        color: 'blue',
        symbol: '8'
    },
    {
        id: '9b',
        url: 'https://i.postimg.cc/bYkLNJVq/9-Blue.png',
        color: 'blue',
        symbol: '9'
    },
    // {
    //     id: "p4",
    //     url: "https://cdn.discordapp.com/attachments/775746031458975824/854521694436589588/New_Project.jpg",
    //     color: "comodin",
    //     symbol:"+4"
    // },
    {
        id: 'py',
        url: 'https://i.postimg.cc/FzfCFg6p/Plus2-Yellow.png',
        color: 'yellow',
        symbol: '+2'
    },
    {
        id: 'pr',
        url: 'https://i.postimg.cc/g0c8dcXk/Plus2-Red.png',
        color: 'red',
        symbol: '+2'
    },
    {
        id: 'pg',
        url: 'https://i.postimg.cc/MKKgNVtn/Plus2-green.png',
        color: 'green',
        symbol: '+2'
    },
    {
        id: 'pb',
        url: 'https://i.postimg.cc/MKJPyRfc/2-Blue.png',
        color: 'blue',
        symbol: '+2'
    },
    // {
    //     id: "cc",
    //     url: "https://cdn.discordapp.com/attachments/775746031458975824/854521694436589588/New_Project.jpg",
    //     color: "comodin",
    //     symbol: "comodin"
    // },
    {
        id: 'ry',
        url: 'https://i.postimg.cc/qqYY2ZKW/Reverse-Yellow.png',
        color: 'yellow',
        symbol: 'reverse'
    },
    {
        id: 'rb',
        url: 'https://i.postimg.cc/wxm4yFM8/Reverse-Blue.png',
        color: 'blue',
        symbol : 'reverse'
    },
    {
        id: 'rg',
        url: 'https://i.postimg.cc/wMHY7rh2/Reverse-green.png',
        color: 'green',
        symbol : 'reverse'
    },
    {
        id: 'rr',
        url: 'https://i.postimg.cc/xCcmJs3w/Reverse-Red.png',
        color: 'red',
        symbol : 'reverse'
    },
    {
        id: 'cr',
        url: 'https://i.postimg.cc/CK6BgGpm/Block-Red.png',
        color: 'red',
        symbol: 'cancell'
    },
    {
        id: 'cb',
        url: 'https://i.postimg.cc/9F2b4hsZ/Block-Blue.png',
        color: 'blue',
        symbol: 'cancell'
    },
    {
        id: 'cy',
        url: 'https://i.postimg.cc/MHhPnf2S/Block-Yellow.png',
        color: 'yellow',
        symbol: 'cancell'
    },
    {
        id: 'cg',
        url: 'https://i.postimg.cc/L5vwh844/Block-Green.png',
        color: 'green',
        symbol: 'cancell'
    }
]
