export interface Item {
  id: string;
  title: string;
  price: string;
  unit: string;
  image: string;
  category: string;
  likes: number;
  location: string;
  owner: {
    name: string;
    avatar: string;
    rating: number;
    reviews: number;
  };
  description: string;
}

export interface Chat {
  id: string;
  user: {
    name: string;
    avatar: string;
    status: 'online' | 'offline';
  };
  lastMessage: string;
  time: string;
  unread?: boolean;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'me' | 'other';
}

export interface ToyProduct {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  image: string;
  price: number;
  rentPriceDay: number;
  rentPriceMonth: number;
  ageRange: string;
  brand: string;
  stock: number;
  status: string;
  description: string;
  categoryName: string;
  nickName: string;
  avatar: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  sort: number;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  duration: number;
  createTime: string;
  productName: string;
  productImage: string;
  rentPriceMonth: number;
}

export interface ToyOrder {
  id: number;
  orderNo: string;
  userId: number;
  addressId: number;
  totalRent: number;
  deposit: number;
  status: string;
  payTime?: string;
  logisticsNo: string;
  returnLogisticsNo: string;
  createTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  rentPrice: number;
  duration: number;
  productName: string;
  productImage: string;
}

export interface Address {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: string;
}

export interface Evaluation {
  id: number;
  orderId: number;
  productId: number;
  userId: number;
  rating: number;
  content: string;
  images: string;
  nickName: string;
  avatar: string;
  createTime: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  images: string;
  nickName: string;
  avatar: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createTime: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  nickName: string;
  avatar: string;
  createTime: string;
}

export type View = 'discovery' | 'nearby' | 'post' | 'messages' | 'me' | 'detail';
