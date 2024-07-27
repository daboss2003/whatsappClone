import { Fontisto } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

export const settingsData = [
    {
        header: 'Account',
        text: 'Security notifications, change number',
        icon: (color) => <Fontisto name="key" size={24} color={color} />
    },
    {
        header: 'Privacy',
        text: 'Block contacts, disappearing messages',
        icon: (color) => <MaterialIcons name="lock" size={24} color={color} />
    },
    {
        header: 'Avatar',
        text: 'Create, edit, profile photo',
        icon: (color) => <MaterialCommunityIcons name="emoticon" size={24} color={color} />
    },
    {
        header: 'Chats',
        text: 'Theme, wallpapers, chat history',
        icon: (color) => <MaterialIcons name="chat" size={24} color={color} />
    },
    {
        header: 'Notifications',
        text: 'Message, group & call tones',
        icon: (color) => <FontAwesome name="bell" size={24} color={color} />
    },
    {
        header: 'Storage and data',
        text: 'Network usage, auto-download',
        icon: (color) => <MaterialIcons name="data-usage" size={24} color={color} />
    },
    {
        header: 'App language',
        text: "English (device's language)",
        icon: (color) => <Ionicons name="globe-outline" size={24} color={color} />
    },
    {
        header: 'Help',
        text: "Help center, contact us, privacy policy",
        icon: (color) => <FontAwesome6 name="question-circle" size={24} color={color} />
    },
    {
        header: 'Invite a friend',
        text: "",
        icon: (color) => <FontAwesome5 name="user-friends" size={24} color={color} />
    },
    {
        header: 'App updates',
        text: "",
        icon: (color) => <MaterialIcons name="app-settings-alt" size={24} color={color} />
    }
];

export const bussiness = [
    {
        header: 'Business Profile',
        text: "Manage address, hours, and websites",
        icon: (color) => <FontAwesome6 name="shop" size={20} color={color} />
    },
    {
        header: 'Catelog',
        text: "Show products and services",
        icon: (color) => <MaterialCommunityIcons name="grid" size={24} color={color} />
    },
    {
        header: 'Advertise',
        text: "Create ads that lead to whatsApp",
        icon: (color) => <Ionicons name="megaphone-outline" size={24} color={color} />
    },
    {
        header: 'Facebook & Instagram',
        text: "Add WhatsApp to your accounts",
        icon: (color) => <Ionicons name="link" size={24} color={color} />
    },
    {
        header: 'Greeting message',
        text: "Welcome new customers automatically",
        icon: (color) => <MaterialCommunityIcons name="sticker-emoji" size={24} color={color} />
    },
    {
        header: 'Away message',
        text: "Reply automatically when you're away",
        icon: (color) => <MaterialCommunityIcons name="umbrella-beach-outline" size={24} color={color} />
    },
    {
        header: 'Quick replies',
        text: "Reuse frequent messages",
        icon: (color) => <FontAwesome6 name="bolt" size={24} color={color} />
    },
    {
        header: 'Labels',
        text: "Organize chats and customers",
        icon: (color) => <MaterialIcons name="label-outline" size={24} color={color} />
    },
    {
        header: 'Help center',
        text: "Get help, contact us",
        icon: (color) => <FontAwesome6 name="question-circle" size={24} color={color} />
    }
];


export const modalData = [
  {
    header: 'Profile views',
    text: 'The number of times your profile was viewed in the last 7 days'
  },
  {
    header: 'Catalog views',
    text: 'The number of times your catalog was visited in the last 7 days.'
  },
  {
    header: 'Status views',
    text: 'The number of times your status was viewed in the last 7 days.'
  }
];

export const previewData = [
    {
        icon: (color) => <Fontisto name="nav-icon-grid" size={24} color={color} />,
        number: Math.floor(Math.random() * 20),
        text: 'Catalog views'
    },
    {
        icon: (color) => <FontAwesome6 name="shop" size={24} color={color} />,
        number: Math.floor(Math.random() * 30),
        text: 'Profile views'
    },
    {
        icon: (color) => <MaterialCommunityIcons name="camera-iris" size={24} color={color} />,
        number: Math.floor(Math.random() * 40),
        text: 'Status views'
    }
      
];

export const placeHolder = 'https://firebasestorage.googleapis.com/v0/b/mobile-chat-58d8b.appspot.com/images%F2placeHolder.png'



export const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


// const hexColors = [];
// for (let i = 0; i < 600; i++){
//     const color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
//     hexColors.push(color)
// }

// console.log(JSON.stringify(hexColors));