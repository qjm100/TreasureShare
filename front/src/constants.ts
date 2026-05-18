import { Item, Chat, Message } from './types';

export const ITEMS: Item[] = [
  {
    id: '1',
    title: '复古精装本系列：动物冒险',
    price: '0',
    unit: '免费',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx0nv15qEiWe2Ugl0LNrirtbAZhjGxe8iQ-lFOZ6ZKEpsG62CnOsohUFWeiGsBkXWkS8214DAwOtFFJBLvuOClT5xjCH75OHA7OfVPgEfJBaEJcQfhQfvK27qi5qOKB-bGDI5N6p_tOliWhesNl-Wdd-OWFDJfNlpfmxA2e0Tz9aPdpEC44nlk8iXSPCcIiUYNj4_Kv9WhLiTMb8Dbsk5DMoz6i_jdwt0-pouMwdXLI4QlUFNY2ofEdnm79rTOarnE_c133wVm_VuK',
    category: '书籍',
    likes: 124,
    location: '布鲁克林，纽约',
    owner: {
      name: 'Arthur Miller',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp6TqDfOvpsmyRg4CUAz_RGF3w3oFmXcQbT2gZHnz3BeBF9bJQ68d9HsVQ_CFtNpSqkpiNgSr9NEBcdiy7qbQzdIbH2PmB6I-BqJAhrpGW3CWI08wQbblndDnQzALGHYrpr-sIYx5ljdKLcWbqqR8_ZgMck1SiMAunVLXVbWMbvPR-QmA__6vbcfqOieiBQeBoEqKNrKRp8q8vQbM01qzy48YrvXE64aCeAM-1wAfYcGiUjCqTRXZBRHyM4xlpFfGX17DSlDvwj9as',
      rating: 4.9,
      reviews: 12,
    },
    description: '一套精美的经典儿童图画书，带您重温童年的冒险。',
  },
  {
    id: '2',
    title: '经典蒙台梭利木制积木组（32块）',
    price: '2',
    unit: '周',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtz5pVck01zcU5-_KO4SybrVE0y88xJgb5mG-mTGlgiAglKmchxwygVs35b10IvL2GVOgSaR2ihv6A3P4oAjdvq0i9--VFrt6KXD69t0VXtjS3DGC-fqGD9oxBjh6y_6GNdpsNL8lGr2qNkcdoDfKs54UbaEP91GOkw7zkYJMFAzGAUrXLJ_cwtBZAPJaaOF08vl_C-IwndjLHM9U9qKZQUdnSnz9vMuoH0tmUcRujT9FzyY_nmAyW5fqwkE8xJJUYCSj9hIdnb1og',
    category: '玩具',
    likes: 89,
    location: '公园坡，纽约',
    owner: {
      name: 'Sarah Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWKRGnDcvnhNLS4OCP_5A2yewOltOn4aHVspbwJxvaIluqkv-AP6ubD9YAlPy0DKPTsQYB8FTFzn4xyILD0rBwWp44DTlqIjAV2c4e2s_1mGUjy8_EZYeGvQhcAXNuL890R9J-9-75R2v-y1FeKfz02KlTEUmhu_Ueqms0Aw2lbNBaTXzUBzmme1DVPNkptsB_Slg09Awl8pSfdcF-aFRNbGY-Hxz0v6aLbjyVe-UwQlaGUkTDPh4KT7aLPyiOffemDSRpLU03o7wN',
      rating: 4.8,
      reviews: 8,
    },
    description: '高品质彩色木制积木，培养孩子的空间想象力。',
  },
  {
    id: '3',
    title: '乐高狮子骑士城堡 (10305)',
    price: '15',
    unit: '天',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUkr_vRB9LgS8qM7_BQ3iCQ-Yg_emGLyNpH6GeQXKiqV1Z-H_waSiUcvc5Aj8QWNyExxPwDh-0AAmEXOWZTAwviDU_Fx3urQMFUWi5T_9bjqOmdCLHKdz7Z063ZUB22wGxpKVnpK4c-evRbDUf0nYW5FM3F9mBEasIDn-up5uT5jN-HejvN0ypFHy2-wkaeVBr2udPTXuwKftcqKnLnPjlMIcENCWoqcdcoYoG3a_kfdBowJTAqMRB3z-EgdDZJc8EE1U2IeII-IR-',
    category: '玩具',
    likes: 215,
    location: '布鲁克林，纽约',
    owner: {
      name: 'Arthur Miller',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBflHTxPz-n5BM8LMeHb9zzyYs-pJzgSQ6_wlGq9LhUnuwf0Fp3d0eOxVhi-JObk82u_zpikew-bsv41H10shO08g0t2-99MbNi6a3NaZnWRk9KIXuiNMWLBGnoF75eDtO9gRJ--jNjPaK83J6Xk8wLqjwAEYyRYcCjnGRQZ_m_Ru16sfCJQdftuD5LUElzplE5JuIrXeWwafSLt8Y8TRnhmdgHf65rSXYOxSF2wkAy_EDqfW8LYGUHO3et0OO-GSpGPbtj6JX1alHM',
      rating: 4.9,
      reviews: 124,
    },
    description: '经典的乐高城堡致敬之作，包含4514块零件和22个小人仔。',
  }
];

export const CHATS: Chat[] = [
  {
    id: 'c1',
    user: {
      name: 'Arthur Miller',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBflHTxPz-n5BM8LMeHb9zzyYs-pJzgSQ6_wlGq9LhUnuwf0Fp3d0eOxVhi-JObk82u_zpikew-bsv41H10shO08g0t2-99MbNi6a3NaZnWRk9KIXuiNMWLBGnoF75eDtO9gRJ--jNjPaK83J6Xk8wLqjwAEYyRYcCjnGRQZ_m_Ru16sfCJQdftuD5LUElzplE5JuIrXeWwafSLt8Y8TRnhmdgHf65rSXYOxSF2wkAy_EDqfW8LYGUHO3et0OO-GSpGPbtj6JX1alHM',
      status: 'online',
    },
    lastMessage: '城堡还在吗？',
    time: '12:45 PM',
    unread: true,
  },
  {
    id: 'c2',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWKRGnDcvnhNLS4OCP_5A2yewOltOn4aHVspbwJxvaIluqkv-AP6ubD9YAlPy0DKPTsQYB8FTFzn4xyILD0rBwWp44DTlqIjAV2c4e2s_1mGUjy8_EZYeGvQhcAXNuL890R9J-9-75R2v-y1FeKfz02KlTEUmhu_Ueqms0Aw2lbNBaTXzUBzmme1DVPNkptsB_Slg09Awl8pSfdcF-aFRNbGY-Hxz0v6aLbjyVe-UwQlaGUkTDPh4KT7aLPyiOffemDSRpLU03o7wN',
      status: 'offline',
    },
    lastMessage: '再次感谢你的梯子！',
    time: '昨天',
  }
];

export const MESSAGES: Message[] = [
  { id: 'm1', text: "你好！我正在为我儿子下周末的生日派对做计划。乐高城堡在下周五到周日还有空闲吗？", time: '12:42 PM', sender: 'other' },
  { id: 'm2', text: "希瑟！预祝你儿子生日快乐。是的，那个日期目前还有空。它很干净，所有零件都放在贴有标签的箱子里。", time: '12:44 PM', sender: 'me' },
  { id: 'm3', text: "听起来太棒了。一个小问题：它装箱后有多大？我会骑着带拖车的自行车过来取。", time: '12:45 PM', sender: 'other' },
];
