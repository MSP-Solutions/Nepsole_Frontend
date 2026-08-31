export interface District {
  id: number;
  name: string;
  provinceId: number;
}

export interface Province {
  id: number;
  name: string;
  districts: District[];
}

export const provinces: Province[] = [
  {
    id: 1,
    name: "Koshi Province",
    districts: [
      { id: 1, name: "Bhojpur", provinceId: 1 },
      { id: 2, name: "Dhankuta", provinceId: 1 },
      { id: 3, name: "Ilam", provinceId: 1 },
      { id: 4, name: "Jhapa", provinceId: 1 },
      { id: 5, name: "Khotang", provinceId: 1 },
      { id: 6, name: "Morang", provinceId: 1 },
      { id: 7, name: "Okhaldhunga", provinceId: 1 },
      { id: 8, name: "Panchthar", provinceId: 1 },
      { id: 9, name: "Sankhuwasabha", provinceId: 1 },
      { id: 10, name: "Solukhumbu", provinceId: 1 },
      { id: 11, name: "Sunsari", provinceId: 1 },
      { id: 12, name: "Taplejung", provinceId: 1 },
      { id: 13, name: "Terhathum", provinceId: 1 },
      { id: 14, name: "Udayapur", provinceId: 1 },
    ],
  },
  {
    id: 2,
    name: "Madhesh Province",
    districts: [
      { id: 15, name: "Bara", provinceId: 2 },
      { id: 16, name: "Dhanusha", provinceId: 2 },
      { id: 17, name: "Mahottari", provinceId: 2 },
      { id: 18, name: "Parsa", provinceId: 2 },
      { id: 19, name: "Rautahat", provinceId: 2 },
      { id: 20, name: "Saptari", provinceId: 2 },
      { id: 21, name: "Sarlahi", provinceId: 2 },
      { id: 22, name: "Siraha", provinceId: 2 },
    ],
  },
  {
    id: 3,
    name: "Bagmati Province",
    districts: [
      { id: 23, name: "Bhaktapur", provinceId: 3 },
      { id: 24, name: "Chitwan", provinceId: 3 },
      { id: 25, name: "Dhading", provinceId: 3 },
      { id: 26, name: "Dolakha", provinceId: 3 },
      { id: 27, name: "Kathmandu", provinceId: 3 },
      { id: 28, name: "Kavrepalanchok", provinceId: 3 },
      { id: 29, name: "Lalitpur", provinceId: 3 },
      { id: 30, name: "Makwanpur", provinceId: 3 },
      { id: 31, name: "Nuwakot", provinceId: 3 },
      { id: 32, name: "Ramechhap", provinceId: 3 },
      { id: 33, name: "Rasuwa", provinceId: 3 },
      { id: 34, name: "Sindhuli", provinceId: 3 },
      { id: 35, name: "Sindhupalchok", provinceId: 3 },
    ],
  },
  {
    id: 4,
    name: "Gandaki Province",
    districts: [
      { id: 36, name: "Baglung", provinceId: 4 },
      { id: 37, name: "Gorkha", provinceId: 4 },
      { id: 38, name: "Kaski", provinceId: 4 },
      { id: 39, name: "Lamjung", provinceId: 4 },
      { id: 40, name: "Manang", provinceId: 4 },
      { id: 41, name: "Mustang", provinceId: 4 },
      { id: 42, name: "Myagdi", provinceId: 4 },
      { id: 43, name: "Nawalpur", provinceId: 4 },
      { id: 44, name: "Parbat", provinceId: 4 },
      { id: 45, name: "Syangja", provinceId: 4 },
      { id: 46, name: "Tanahun", provinceId: 4 },
    ],
  },
  {
    id: 5,
    name: "Lumbini Province",
    districts: [
      { id: 47, name: "Arghakhanchi", provinceId: 5 },
      { id: 48, name: "Banke", provinceId: 5 },
      { id: 49, name: "Bardiya", provinceId: 5 },
      { id: 50, name: "Dang", provinceId: 5 },
      { id: 51, name: "Eastern Rukum", provinceId: 5 },
      { id: 52, name: "Gulmi", provinceId: 5 },
      { id: 53, name: "Kapilvastu", provinceId: 5 },
      { id: 54, name: "Nawalparasi", provinceId: 5 },
      { id: 55, name: "Palpa", provinceId: 5 },
      { id: 56, name: "Pyuthan", provinceId: 5 },
      { id: 57, name: "Rolpa", provinceId: 5 },
      { id: 58, name: "Rupandehi", provinceId: 5 },
    ],
  },
  {
    id: 6,
    name: "Karnali Province",
    districts: [
      { id: 59, name: "Dailekh", provinceId: 6 },
      { id: 60, name: "Dolpa", provinceId: 6 },
      { id: 61, name: "Humla", provinceId: 6 },
      { id: 62, name: "Jajarkot", provinceId: 6 },
      { id: 63, name: "Jumla", provinceId: 6 },
      { id: 64, name: "Kalikot", provinceId: 6 },
      { id: 65, name: "Mugu", provinceId: 6 },
      { id: 66, name: "Salyan", provinceId: 6 },
      { id: 67, name: "Surkhet", provinceId: 6 },
      { id: 68, name: "Western Rukum", provinceId: 6 },
    ],
  },
  {
    id: 7,
    name: "Sudurpashchim Province",
    districts: [
      { id: 69, name: "Achham", provinceId: 7 },
      { id: 70, name: "Baitadi", provinceId: 7 },
      { id: 71, name: "Bajhang", provinceId: 7 },
      { id: 72, name: "Bajura", provinceId: 7 },
      { id: 73, name: "Dadeldhura", provinceId: 7 },
      { id: 74, name: "Darchula", provinceId: 7 },
      { id: 75, name: "Doti", provinceId: 7 },
      { id: 76, name: "Kailali", provinceId: 7 },
      { id: 77, name: "Kanchanpur", provinceId: 7 },
    ],
  },
];