export type LocalFood = {
  name:      string
  serving:   string
  calories:  number
  protein_g: number
  carbs_g:   number
  fat_g:     number
}

const foods: LocalFood[] = [
  // ── Rice dishes ──────────────────────────────────────────
  { name: 'Nasi Lemak',                    serving: '1 plate',       calories: 644, protein_g: 22, carbs_g: 85,  fat_g: 25 },
  { name: 'Nasi Goreng',                   serving: '1 plate',       calories: 520, protein_g: 15, carbs_g: 75,  fat_g: 18 },
  { name: 'Nasi Goreng Kampung',           serving: '1 plate',       calories: 560, protein_g: 18, carbs_g: 78,  fat_g: 20 },
  { name: 'Nasi Briyani Chicken',          serving: '1 plate',       calories: 680, protein_g: 28, carbs_g: 88,  fat_g: 22 },
  { name: 'Nasi Kandar',                   serving: '1 plate',       calories: 700, protein_g: 25, carbs_g: 90,  fat_g: 28 },
  { name: 'Nasi Putih / Steamed White Rice', serving: '1 cup (180g)', calories: 240, protein_g: 4,  carbs_g: 52,  fat_g: 1  },
  { name: 'Chicken Rice, Hainanese',       serving: '1 plate',       calories: 520, protein_g: 25, carbs_g: 72,  fat_g: 14 },
  { name: 'Thai Basil Rice / Khao Pad Krapow', serving: '1 plate',   calories: 500, protein_g: 22, carbs_g: 68,  fat_g: 16 },
  { name: 'Banana Leaf Rice',              serving: '1 plate',       calories: 620, protein_g: 22, carbs_g: 85,  fat_g: 20 },
  { name: 'Claypot Chicken Rice',          serving: '1 pot',         calories: 620, protein_g: 26, carbs_g: 82,  fat_g: 20 },
  { name: 'Turmeric Chicken Rice',         serving: '1 plate',       calories: 560, protein_g: 26, carbs_g: 70,  fat_g: 16 },

  // ── Noodle dishes ─────────────────────────────────────────
  { name: 'Char Kway Teow',                serving: '1 plate',       calories: 580, protein_g: 16, carbs_g: 75,  fat_g: 24 },
  { name: 'Mee Goreng',                    serving: '1 plate',       calories: 520, protein_g: 18, carbs_g: 70,  fat_g: 18 },
  { name: 'Mee Goreng Mamak',              serving: '1 plate',       calories: 550, protein_g: 18, carbs_g: 75,  fat_g: 20 },
  { name: 'Laksa',                         serving: '1 bowl',        calories: 440, protein_g: 16, carbs_g: 52,  fat_g: 18 },
  { name: 'Asam Laksa',                    serving: '1 bowl',        calories: 320, protein_g: 14, carbs_g: 48,  fat_g:  7 },
  { name: 'Curry Laksa',                   serving: '1 bowl',        calories: 480, protein_g: 18, carbs_g: 54,  fat_g: 22 },
  { name: 'Wonton Mee',                    serving: '1 bowl',        calories: 420, protein_g: 18, carbs_g: 58,  fat_g: 12 },
  { name: 'Pan Mee',                       serving: '1 bowl',        calories: 450, protein_g: 18, carbs_g: 62,  fat_g: 14 },
  { name: 'Hokkien Mee',                   serving: '1 plate',       calories: 560, protein_g: 18, carbs_g: 72,  fat_g: 22 },
  { name: 'Prawn Mee / Har Mee',           serving: '1 bowl',        calories: 380, protein_g: 20, carbs_g: 48,  fat_g: 10 },
  { name: 'Maggi Goreng',                  serving: '1 plate',       calories: 520, protein_g: 14, carbs_g: 68,  fat_g: 22 },
  { name: 'Bak Chor Mee',                  serving: '1 bowl',        calories: 430, protein_g: 20, carbs_g: 55,  fat_g: 14 },
  { name: 'Pad Thai',                      serving: '1 plate',       calories: 550, protein_g: 20, carbs_g: 72,  fat_g: 18 },

  // ── Indian / Mamak ────────────────────────────────────────
  { name: 'Roti Canai, plain',             serving: '1 piece',       calories: 300, protein_g:  7, carbs_g: 45,  fat_g: 10 },
  { name: 'Roti Canai with Dhal',          serving: '1 piece + dhal',calories: 380, protein_g: 12, carbs_g: 55,  fat_g: 12 },
  { name: 'Roti Canai with Curry',         serving: '1 piece + curry',calories:420, protein_g: 14, carbs_g: 52,  fat_g: 15 },
  { name: 'Roti Telur / Egg Roti',         serving: '1 piece',       calories: 380, protein_g: 10, carbs_g: 48,  fat_g: 16 },
  { name: 'Tosai / Thosai',               serving: '1 piece',       calories: 150, protein_g:  4, carbs_g: 28,  fat_g:  3 },
  { name: 'Capati',                        serving: '1 piece',       calories: 180, protein_g:  5, carbs_g: 32,  fat_g:  4 },
  { name: 'Naan',                          serving: '1 piece',       calories: 260, protein_g:  8, carbs_g: 45,  fat_g:  6 },
  { name: 'Tandoori Chicken',              serving: '1 piece',       calories: 260, protein_g: 30, carbs_g:  4,  fat_g: 12 },

  // ── Proteins & curries ────────────────────────────────────
  { name: 'Rendang Chicken',               serving: '1 piece (~100g)',calories: 280, protein_g: 22, carbs_g:  6,  fat_g: 18 },
  { name: 'Rendang Beef',                  serving: '1 portion',     calories: 320, protein_g: 26, carbs_g:  8,  fat_g: 20 },
  { name: 'Satay Chicken',                 serving: '10 sticks',     calories: 380, protein_g: 32, carbs_g: 18,  fat_g: 18 },
  { name: 'Satay Beef',                    serving: '10 sticks',     calories: 360, protein_g: 30, carbs_g: 16,  fat_g: 18 },
  { name: 'Ayam Goreng / Fried Chicken',   serving: '1 piece',       calories: 280, protein_g: 24, carbs_g: 10,  fat_g: 16 },
  { name: 'Ayam Percik / Grilled Chicken', serving: '1 piece',       calories: 240, protein_g: 28, carbs_g:  6,  fat_g: 12 },
  { name: 'Turmeric Chicken / Ayam Kunyit',serving: '1 piece',       calories: 260, protein_g: 26, carbs_g:  4,  fat_g: 15 },
  { name: 'Ikan Bakar / Grilled Fish',     serving: '1 piece (~200g)',calories: 240, protein_g: 36, carbs_g:  2,  fat_g: 10 },
  { name: 'Curry Chicken',                 serving: '1 portion',     calories: 320, protein_g: 24, carbs_g:  8,  fat_g: 20 },
  { name: 'Sambal Prawns',                 serving: '1 portion',     calories: 220, protein_g: 20, carbs_g: 12,  fat_g: 10 },
  { name: 'Bak Kut Teh',                   serving: '1 portion + rice',calories: 480, protein_g: 28, carbs_g: 48, fat_g: 18 },
  { name: 'Char Siu / BBQ Pork',           serving: '1 portion',     calories: 280, protein_g: 22, carbs_g: 18,  fat_g: 12 },
  { name: 'Char Siu Rice',                 serving: '1 plate',       calories: 560, protein_g: 24, carbs_g: 72,  fat_g: 18 },

  // ── Thai dishes ───────────────────────────────────────────
  { name: 'Tom Yam Soup',                  serving: '1 bowl',        calories: 180, protein_g: 14, carbs_g:  8,  fat_g:  8 },
  { name: 'Tom Kha Gai',                   serving: '1 bowl',        calories: 280, protein_g: 18, carbs_g: 10,  fat_g: 18 },
  { name: 'Green Curry Chicken with Rice', serving: '1 plate',       calories: 520, protein_g: 22, carbs_g: 68,  fat_g: 18 },
  { name: 'Mango Sticky Rice',             serving: '1 portion',     calories: 400, protein_g:  5, carbs_g: 80,  fat_g:  8 },
  { name: 'Som Tam / Papaya Salad',        serving: '1 portion',     calories: 120, protein_g:  4, carbs_g: 20,  fat_g:  3 },

  // ── Dim Sum / Chinese ─────────────────────────────────────
  { name: 'Har Gow / Prawn Dumpling',      serving: '3 pieces',      calories: 130, protein_g:  8, carbs_g: 18,  fat_g:  3 },
  { name: 'Siu Mai',                       serving: '3 pieces',      calories: 160, protein_g: 10, carbs_g: 16,  fat_g:  6 },
  { name: 'Char Siu Bao, steamed',         serving: '1 piece',       calories: 200, protein_g:  8, carbs_g: 30,  fat_g:  5 },
  { name: 'Char Siu Bao, baked',           serving: '1 piece',       calories: 240, protein_g:  8, carbs_g: 36,  fat_g:  8 },
  { name: 'Congee / Rice Porridge, plain', serving: '1 bowl',        calories: 180, protein_g:  4, carbs_g: 40,  fat_g:  1 },
  { name: 'Congee with Century Egg & Pork',serving: '1 bowl',        calories: 260, protein_g: 14, carbs_g: 40,  fat_g:  6 },
  { name: 'Lo Mai Gai / Glutinous Rice',   serving: '1 parcel',      calories: 380, protein_g: 12, carbs_g: 58,  fat_g: 10 },
  { name: 'Cheong Fun / Rice Roll',        serving: '2 pieces',      calories: 180, protein_g:  5, carbs_g: 32,  fat_g:  4 },

  // ── Snacks & street food ──────────────────────────────────
  { name: 'Curry Puff / Karipap',          serving: '1 piece',       calories: 200, protein_g:  5, carbs_g: 25,  fat_g:  9 },
  { name: 'Pisang Goreng / Banana Fritter',serving: '1 piece',       calories: 160, protein_g:  2, carbs_g: 26,  fat_g:  6 },
  { name: 'Kuih Lapis',                    serving: '1 piece',       calories: 110, protein_g:  2, carbs_g: 22,  fat_g:  2 },
  { name: 'Onde Onde',                     serving: '3 pieces',      calories: 180, protein_g:  2, carbs_g: 34,  fat_g:  4 },
  { name: 'Popiah, fresh',                 serving: '1 roll',        calories: 200, protein_g:  7, carbs_g: 30,  fat_g:  6 },
  { name: 'Rojak',                         serving: '1 portion',     calories: 250, protein_g:  5, carbs_g: 40,  fat_g:  8 },

  // ── Drinks ────────────────────────────────────────────────
  { name: 'Teh Tarik',                     serving: '1 cup',         calories: 105, protein_g:  4, carbs_g: 16,  fat_g:  3 },
  { name: 'Teh C',                         serving: '1 cup',         calories:  80, protein_g:  3, carbs_g: 12,  fat_g:  2 },
  { name: 'Kopi O',                        serving: '1 cup, black',  calories:  25, protein_g:  0, carbs_g:  6,  fat_g:  0 },
  { name: 'Kopi Susu',                     serving: '1 cup',         calories: 110, protein_g:  3, carbs_g: 18,  fat_g:  3 },
  { name: 'Milo',                          serving: '1 cup with milk',calories: 140, protein_g:  6, carbs_g: 20,  fat_g:  4 },
  { name: 'Milo O',                        serving: '1 cup with water',calories: 80, protein_g:  2, carbs_g: 16,  fat_g:  1 },
  { name: 'Sirap Bandung',                 serving: '1 cup',         calories: 120, protein_g:  1, carbs_g: 28,  fat_g:  1 },
  { name: 'Sugarcane Juice',               serving: '1 cup',         calories:  90, protein_g:  0, carbs_g: 22,  fat_g:  0 },

  // ── Fruits ────────────────────────────────────────────────
  { name: 'Durian',                        serving: '1 seed (~50g)', calories: 147, protein_g: 1.5, carbs_g: 16, fat_g: 9  },
  { name: 'Rambutan',                      serving: '5 pieces',      calories:  75, protein_g: 0.5, carbs_g: 20, fat_g: 0  },
  { name: 'Mangosteen',                    serving: '2 pieces',      calories:  80, protein_g: 0.5, carbs_g: 20, fat_g: 0  },
  { name: 'Jackfruit / Nangka',            serving: '1 cup',         calories: 155, protein_g: 2.5, carbs_g: 40, fat_g: 1  },
  { name: 'Ciku / Sapodilla',              serving: '2 pieces',      calories: 140, protein_g:  1,  carbs_g: 34, fat_g: 1  },

  // ── Desserts ──────────────────────────────────────────────
  { name: 'Cendol',                        serving: '1 bowl',        calories: 280, protein_g:  3, carbs_g: 55,  fat_g:  6 },
  { name: 'Ais Kacang / ABC',              serving: '1 bowl',        calories: 230, protein_g:  4, carbs_g: 48,  fat_g:  3 },
  { name: 'Bubur Cha Cha',                 serving: '1 bowl',        calories: 260, protein_g:  3, carbs_g: 46,  fat_g:  7 },

  // ── More Southeast Asian ──────────────────────────────────
  { name: 'Nasi Padang',                   serving: '1 plate',       calories: 680, protein_g: 24, carbs_g: 82,  fat_g: 28 },
  { name: 'Gado-Gado',                     serving: '1 portion',     calories: 380, protein_g: 14, carbs_g: 38,  fat_g: 20 },
  { name: 'Soto Ayam',                     serving: '1 bowl',        calories: 280, protein_g: 20, carbs_g: 28,  fat_g:  8 },
  { name: 'Murtabak',                      serving: '1 piece',       calories: 480, protein_g: 18, carbs_g: 52,  fat_g: 22 },
  { name: 'Lontong',                       serving: '1 bowl',        calories: 340, protein_g: 12, carbs_g: 46,  fat_g: 12 },
  { name: 'Otak-Otak',                     serving: '2 pieces',      calories: 160, protein_g: 12, carbs_g: 10,  fat_g:  8 },

  // ── Korean ────────────────────────────────────────────────
  { name: 'Bibimbap',                      serving: '1 bowl',        calories: 550, protein_g: 18, carbs_g: 80,  fat_g: 14 },
  { name: 'Kimchi Fried Rice',             serving: '1 plate',       calories: 490, protein_g: 14, carbs_g: 72,  fat_g: 16 },
  { name: 'Tteokbokki / Korean Rice Cake', serving: '1 portion',     calories: 340, protein_g:  8, carbs_g: 68,  fat_g:  5 },
  { name: 'Korean BBQ Pork Belly / Samgyeopsal', serving: '1 portion (150g)', calories: 500, protein_g: 24, carbs_g: 0, fat_g: 44 },
  { name: 'Bulgogi / Korean Beef',         serving: '1 portion',     calories: 320, protein_g: 26, carbs_g: 18,  fat_g: 14 },
  { name: 'Kimbap',                        serving: '1 roll',        calories: 350, protein_g: 12, carbs_g: 58,  fat_g:  8 },
  { name: 'Korean Ramyeon / Instant Ramen',serving: '1 pack',        calories: 500, protein_g: 12, carbs_g: 72,  fat_g: 18 },
  { name: 'Japchae / Glass Noodles',       serving: '1 portion',     calories: 320, protein_g: 10, carbs_g: 52,  fat_g:  8 },
  { name: 'Kimchi',                        serving: '½ cup',         calories:  25, protein_g:  2, carbs_g:  4,  fat_g:  0 },
  { name: 'Korean Fried Chicken',          serving: '6 pieces',      calories: 480, protein_g: 28, carbs_g: 30,  fat_g: 28 },
  { name: 'Doenjang Jjigae / Soybean Stew',serving: '1 bowl',        calories: 160, protein_g: 10, carbs_g: 12,  fat_g:  7 },
  { name: 'Sundubu Jjigae / Tofu Stew',    serving: '1 bowl',        calories: 200, protein_g: 14, carbs_g: 10,  fat_g: 10 },
  { name: 'Samgyetang / Ginseng Chicken Soup', serving: '1 pot',     calories: 560, protein_g: 48, carbs_g: 30,  fat_g: 22 },
  { name: 'Dakgalbi / Spicy Chicken',      serving: '1 portion',     calories: 380, protein_g: 30, carbs_g: 24,  fat_g: 18 },

  // ── Japanese ──────────────────────────────────────────────
  { name: 'Ramen',                         serving: '1 bowl',        calories: 550, protein_g: 22, carbs_g: 70,  fat_g: 18 },
  { name: 'Tonkotsu Ramen',                serving: '1 bowl',        calories: 620, protein_g: 24, carbs_g: 72,  fat_g: 24 },
  { name: 'Udon',                          serving: '1 bowl',        calories: 400, protein_g: 14, carbs_g: 74,  fat_g:  4 },
  { name: 'Soba',                          serving: '1 bowl',        calories: 380, protein_g: 14, carbs_g: 72,  fat_g:  2 },
  { name: 'Salmon Nigiri Sushi',           serving: '2 pieces',      calories: 130, protein_g:  8, carbs_g: 20,  fat_g:  2 },
  { name: 'Sushi Roll / Maki',             serving: '6 pieces',      calories: 250, protein_g:  8, carbs_g: 42,  fat_g:  5 },
  { name: 'Tonkatsu with Rice',            serving: '1 plate',       calories: 650, protein_g: 28, carbs_g: 72,  fat_g: 28 },
  { name: 'Katsu Curry with Rice',         serving: '1 plate',       calories: 720, protein_g: 28, carbs_g: 88,  fat_g: 26 },
  { name: 'Teriyaki Chicken with Rice',    serving: '1 plate',       calories: 520, protein_g: 26, carbs_g: 68,  fat_g: 14 },
  { name: 'Gyoza / Dumplings',             serving: '6 pieces',      calories: 240, protein_g: 10, carbs_g: 28,  fat_g: 10 },
  { name: 'Takoyaki / Octopus Balls',      serving: '6 pieces',      calories: 280, protein_g:  8, carbs_g: 30,  fat_g: 12 },
  { name: 'Onigiri / Rice Ball',           serving: '1 piece',       calories: 180, protein_g:  4, carbs_g: 36,  fat_g:  2 },
  { name: 'Miso Soup',                     serving: '1 bowl',        calories:  40, protein_g:  3, carbs_g:  4,  fat_g:  1 },
  { name: 'Yakitori',                      serving: '5 sticks',      calories: 220, protein_g: 20, carbs_g:  8,  fat_g: 12 },
  { name: 'Karaage / Japanese Fried Chicken', serving: '5 pieces',   calories: 320, protein_g: 24, carbs_g: 14,  fat_g: 18 },
  { name: 'Tempura Prawn',                 serving: '4 pieces',      calories: 240, protein_g: 12, carbs_g: 18,  fat_g: 14 },
  { name: 'Okonomiyaki',                   serving: '1 piece',       calories: 380, protein_g: 14, carbs_g: 44,  fat_g: 16 },

  // ── Middle Eastern / Kebab ────────────────────────────────
  { name: 'Chicken Shawarma Wrap',         serving: '1 wrap',        calories: 550, protein_g: 28, carbs_g: 52,  fat_g: 24 },
  { name: 'Lamb Shawarma Wrap',            serving: '1 wrap',        calories: 580, protein_g: 26, carbs_g: 52,  fat_g: 26 },
  { name: 'Doner Kebab Wrap',              serving: '1 wrap',        calories: 600, protein_g: 28, carbs_g: 58,  fat_g: 26 },
  { name: 'Chicken Kebab Skewer',          serving: '1 skewer',      calories: 280, protein_g: 30, carbs_g:  5,  fat_g: 15 },
  { name: 'Lamb Kebab Skewer',             serving: '1 skewer',      calories: 300, protein_g: 28, carbs_g:  4,  fat_g: 18 },
  { name: 'Falafel',                       serving: '4 pieces',      calories: 200, protein_g:  8, carbs_g: 20,  fat_g: 10 },
  { name: 'Hummus',                        serving: '3 tbsp',        calories: 130, protein_g:  5, carbs_g: 12,  fat_g:  7 },
  { name: 'Pita Bread',                    serving: '1 piece',       calories: 170, protein_g:  6, carbs_g: 34,  fat_g:  1 },
  { name: 'Mandi Rice with Chicken',       serving: '1 plate',       calories: 680, protein_g: 30, carbs_g: 88,  fat_g: 20 },
  { name: 'Naan Kebab',                    serving: '1 wrap',        calories: 480, protein_g: 24, carbs_g: 50,  fat_g: 20 },

  // ── More Thai ─────────────────────────────────────────────
  { name: 'Khao Man Gai / Thai Chicken Rice', serving: '1 plate',    calories: 450, protein_g: 22, carbs_g: 62,  fat_g: 12 },
  { name: 'Pad See Ew',                    serving: '1 plate',       calories: 480, protein_g: 18, carbs_g: 64,  fat_g: 16 },
  { name: 'Massaman Curry with Rice',      serving: '1 plate',       calories: 560, protein_g: 22, carbs_g: 74,  fat_g: 18 },
  { name: 'Pineapple Fried Rice',          serving: '1 plate',       calories: 520, protein_g: 14, carbs_g: 76,  fat_g: 18 },
  { name: 'Larb Chicken / Thai Minced Meat', serving: '1 portion',   calories: 180, protein_g: 22, carbs_g:  8,  fat_g:  6 },
  { name: 'Thai Spring Roll',              serving: '3 pieces',      calories: 210, protein_g:  6, carbs_g: 24,  fat_g: 10 },
  { name: 'Panang Curry with Rice',        serving: '1 plate',       calories: 540, protein_g: 22, carbs_g: 70,  fat_g: 20 },
  { name: 'Khao Tom / Thai Rice Soup',     serving: '1 bowl',        calories: 220, protein_g: 12, carbs_g: 38,  fat_g:  2 },

  // ── More drinks ───────────────────────────────────────────
  { name: 'Boba / Bubble Milk Tea',        serving: '1 cup (500ml)', calories: 340, protein_g:  4, carbs_g: 58,  fat_g: 10 },
  { name: 'Boba / Taro Milk Tea',          serving: '1 cup (500ml)', calories: 360, protein_g:  4, carbs_g: 62,  fat_g: 10 },
  { name: 'Matcha Latte',                  serving: '1 cup',         calories: 180, protein_g:  6, carbs_g: 24,  fat_g:  7 },
  { name: 'Soya Bean Milk',                serving: '1 cup, sweetened', calories: 130, protein_g: 6, carbs_g: 18, fat_g: 4 },
  { name: 'Coconut Water',                 serving: '1 cup (240ml)', calories:  46, protein_g: 0.5, carbs_g: 9,  fat_g:  0 },
  { name: 'Barley Water',                  serving: '1 cup',         calories:  60, protein_g:  1, carbs_g: 14,  fat_g:  0 },
  { name: 'Cincau / Grass Jelly Drink',    serving: '1 cup',         calories: 100, protein_g:  0, carbs_g: 24,  fat_g:  0 },
  { name: 'Cham / Coffee-Tea Mix',         serving: '1 cup',         calories:  95, protein_g:  3, carbs_g: 14,  fat_g:  3 },
  { name: 'Yakult',                        serving: '1 bottle (65ml)', calories: 50, protein_g:  1, carbs_g: 12,  fat_g:  0 },
  { name: 'Fresh Watermelon Juice',        serving: '1 cup',         calories:  70, protein_g:  1, carbs_g: 17,  fat_g:  0 },
  { name: 'Fresh Orange Juice',            serving: '1 cup',         calories: 110, protein_g:  2, carbs_g: 26,  fat_g:  0 },
  { name: 'Lime Juice / Air Limau',        serving: '1 cup',         calories:  45, protein_g:  0, carbs_g: 11,  fat_g:  0 },
  { name: 'Lemon Tea, iced',               serving: '1 cup',         calories:  80, protein_g:  0, carbs_g: 20,  fat_g:  0 },
  { name: 'Neslo / Nescafe + Milo',        serving: '1 cup',         calories: 130, protein_g:  4, carbs_g: 20,  fat_g:  4 },
]

export function searchLocalFoods(query: string): LocalFood[] {
  const q = query.toLowerCase()
  return foods.filter(f => f.name.toLowerCase().includes(q)).slice(0, 6)
}
