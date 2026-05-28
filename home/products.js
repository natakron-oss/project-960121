// Product Data
const products = [
    { 
        id: 1, 
        name: 'คะน้า', 
        category: 'ผัก', 
        price: 30, 
        stock: 15, 
        image: 'home/image/คะน้า.jpg', 
        description: 'ผักกาดสดใหม่จาก Smart Farm ปลูกโดยวิธีการเกษตรไร่ฉกรรจ์ ปลอดสารพิษ' 
    },
    { 
        id: 2, 
        name: 'กะหล่ำปลี', 
        category: 'ผัก', 
        price: 6, 
        stock: 20, 
        image: 'home/image/กะหล่ำปลี.png', 
        description: 'กะหล่ำปลีสดใจหวาน เก็บเชื้อสดใหม่ มีคุณค่าทางอาหารสูง' 
    },
    { 
        id: 3, 
        name: 'ผักกาดขาว', 
        category: 'ผัก', 
        price: 8, 
        stock: 10, 
        image: 'home/image/ผักกาดขาว.png', 
        description: 'ผักกวางตุ้งสดอร่อย เหมาะสำหรับทำน้ำสลัดหรือนึ่ง' 
    },
    { 
        id: 4, 
        name: 'ผักกวางตุ้ง', 
        category: 'ผัก', 
        price: 16, 
        stock: 8, 
        image: 'home/image/ผักกวางตุ้ง.png', 
        description: 'ผักกาดร้านข้างเขียวสด ปลูกในแปลงปลอดโรค' 
    },
    { 
        id: 5, 
        name: 'ต้นหอม', 
        category: 'ผัก', 
        price: 30, 
        stock: 10, 
        image: 'home/image/ต้นหอม.png', 
        description: 'ตะไคร้สดใหม่ เหมาะสำหรับทำแกงหรือชาตะไคร้' 
    },
    { 
        id: 6, 
        name: 'ผักบุ้ง', 
        category: 'ผัก', 
        price: 46, 
        stock: 12, 
        image: 'home/image/ผักบุ้ง.png', 
        description: 'หนอนขั้วอร่อยและมีคุณค่าทางอาหารสูง' 
    },
    { 
        id: 7, 
        name: 'ผักชี', 
        category: 'ผัก', 
        price: 130, 
        stock: 30, 
        image: 'home/image/ผักชี.png', 
        description: 'กวางตุ้งสดใหม่ตรงจากไร่ Smart Farm' 
    },
    { 
        id: 8, 
        name: 'ถั่วฝักยาว', 
        category: 'ผัก', 
        price: 40, 
        stock: 18, 
        image: 'home/image/ถั่วฝักยาว.png', 
        description: 'ต้นหอมสดอร่อยและมีกลิ่นหอมเต่อ' 
    },
    { 
        id: 9, 
        name: 'มะม่วงน้ำดอกไม้ดิบ', 
        category: 'ผลไม้', 
        price: 10, 
        stock: 22, 
        image: 'home/image/มะม่วงน้ำดอกไม้ดิบ.png', 
        description: 'มะม่วงหาม้วนเนื้อเหลืองนุ่มและหวาน' 
    },
    { 
        id: 10, 
        name: 'กล้วยน้ำว้า', 
        category: 'ผลไม้', 
        price: 45, 
        stock: 40, 
        image: 'home/image/กล้วยน้ำว้า.png', 
        description: 'กล้วยน้ำว้าสุกหวาน มีคุณค่าทางอาหารสูง' 
    },
    { 
        id: 11, 
        name: 'ส้มเขียวหวาน', 
        category: 'ผลไม้', 
        price: 12, 
        stock: 15, 
        image: 'home/image/ส้มเขียวหวาน.png', 
        description: 'ส้มซ่านเปรี้ยวหวาน มีวิตามินซีสูง' 
    },
    { 
        id: 12, 
        name: 'เงาะแม่แตง', 
        category: 'ผลไม้', 
        price: 35, 
        stock: 10, 
        image: 'home/image/เงาะแม่แตง.png', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 13, 
        name: 'พริกขี้หนู', 
        category: 'ผัก', 
        price: 90, 
        stock: 22, 
        image: 'home/image/พริกขี้หนู.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 14, 
        name: 'กรีนโอ๊ค/ผักสลัด', 
        category: 'ผัก', 
        price: 110, 
        stock: 40, 
        image: 'home/image/กรีนโอ๊ค.jpeg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 15, 
        name: 'มะเขือเทศ', 
        category: 'ผัก', 
        price: 28, 
        stock: 15, 
        image: 'home/image/มะเขือเทศ.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 16, 
        name: 'กะหล่ำดอก', 
        category: 'ผัก', 
        price: 50, 
        stock: 10, 
        image: 'home/image/กะหล่ำดอก.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 17, 
        name: 'กล้วยหอม', 
        category: 'ผลไม้', 
        price: 140, 
        stock: 15, 
        image: 'home/image/กล้วยหอม.png', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 18, 
        name: 'ฝรั่งกิมจู', 
        category: 'ผลไม้', 
        price: 28, 
        stock: 20, 
        image: 'home/image/ฝรั่งกิมจู.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 19, 
        name: 'ลำไย', 
        category: 'ผลไม้', 
        price: 45, 
        stock: 10, 
        image: 'home/image/ลำไย.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 20, 
        name: 'องุ่น', 
        category: 'ผลไม้', 
        price: 120, 
        stock: 8, 
        image: 'home/image/องุ่น.png', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 21, 
        name: 'มะขามหวาน', 
        category: 'ผลไม้', 
        price: 50, 
        stock: 10, 
        image: 'home/image/มะขามหวาน.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 22, 
        name: 'อะโวคาโด', 
        category: 'ผลไม้', 
        price: 70, 
        stock: 12, 
        image: 'home/image/อะโวคาโด.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 23, 
        name: 'ทับทิม', 
        category: 'ผลไม้', 
        price: 60, 
        stock: 30, 
        image: 'home/image/ทับทิม.jpg', 
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    },
    { 
        id: 24, 
        name: 'มะเฟือง', 
        category: 'ผลไม้', 
        price: 40, 
        stock: 18, 
        image: 'home/image/มะเฟือง.jpg',
        description: 'สตรอเบอร์รี่แดงสด ปลอดสารเคมี' 
    }
];