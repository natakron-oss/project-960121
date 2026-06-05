-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 05, 2026 at 06:04 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trad_market`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `created_at`) VALUES
(7, 2, 42, 2, '2026-06-04 20:53:05'),
(8, 2, 47, 1, '2026-06-04 20:53:08'),
(13, 1, 42, 2, '2026-06-05 03:56:41');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `trade_request_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `is_read` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `trade_request_id`, `order_id`, `is_read`, `created_at`) VALUES
(1, 2, 'new_order', 'มีคำสั่งซื้อใหม่สำหรับสินค้า \"kuy\" จำนวน 1 กก. โดย Makirumi _', NULL, 1, 0, '2026-06-04 21:44:23'),
(2, 2, 'new_order', 'มีคำสั่งซื้อใหม่สำหรับสินค้า \"kuy\" จำนวน 2 กก. โดย Makirumi _', NULL, 2, 0, '2026-06-04 21:46:41'),
(3, 2, 'new_order', 'มีคำสั่งซื้อใหม่สำหรับสินค้า \"kuy\" จำนวน 1 กก. โดย 8885', NULL, 3, 0, '2026-06-05 03:57:11'),
(4, 2, 'new_order', 'มีคำสั่งซื้อใหม่สำหรับสินค้า \"kuy\" จำนวน 2 กก. โดย 589984', NULL, 4, 0, '2026-06-05 03:57:55');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `shipping_method` varchar(50) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'cod',
  `total_price` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `fullname`, `phone`, `address`, `shipping_method`, `payment_method`, `total_price`, `status`, `created_at`) VALUES
(1, 1, 'Makirumi _', '000000', '6669/69', 'cod', 'cod', 50.00, 'paid', '2026-06-04 21:44:23'),
(2, 1, 'Makirumi _', '0000000000', '559/64', 'cod', 'cod', 100.00, 'paid', '2026-06-04 21:46:41'),
(3, 1, '8885', '52941254', '888/88', 'pickuphome', 'qrcode', 50.00, 'pending', '2026-06-05 03:57:11'),
(4, 1, '589984', '488485', '84884/48', 'pickupschool', 'cod', 100.00, 'pending', '2026-06-05 03:57:55');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_order` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price_at_order`) VALUES
(1, 1, 42, 1, 50.00),
(2, 2, 42, 2, 50.00),
(3, 3, 42, 1, 50.00),
(4, 4, 42, 2, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('sell','trade') DEFAULT 'sell',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `user_id`, `name`, `category`, `quantity`, `price`, `description`, `image`, `status`, `created_at`, `expire_date`) VALUES
(42, 2, 'kuy', 'sell', 2, 50.00, 'yai', '1780606131234.jpg', 'sell', '2026-06-04 20:48:51', '2026-06-06'),
(43, 2, 'ley', 'sell', 1, 20.00, 'k', '1780606160862.png', 'sell', '2026-06-04 20:49:20', '2026-06-05'),
(45, 2, 'y', 'trade', 5, 0.00, '5', '1780606255100.jpg', 'trade', '2026-06-04 20:50:55', '2026-06-09'),
(46, 2, 'o', 'trade', 1, 0.00, '1', '1780606310814.jpg', 'trade', '2026-06-04 20:51:50', '2026-06-09'),
(47, 2, 't', 'sell', 1, 50.00, '1', '1780606341694.webp', 'sell', '2026-06-04 20:52:21', '2026-09-12'),
(48, 1, 'นน', 'trade', 49, 0.00, '50', '1780606682678.jpg', 'trade', '2026-06-04 20:58:02', '2026-06-24'),
(49, 1, 'Kub Bom', 'sell', 10, 100.00, '', '1780609395034.png', 'sell', '2026-06-04 21:43:15', '2026-06-09'),
(50, 2, 'คึรัะ', 'sell', 20, 200.00, '', '1780610011398.png', 'sell', '2026-06-04 21:53:31', '2027-01-12'),
(51, 2, 'Kub Bom', 'sell', 5, 55.00, '', '1780610034324.png', 'sell', '2026-06-04 21:53:54', '2026-06-09');

-- --------------------------------------------------------

--
-- Table structure for table `trade_requests`
--

CREATE TABLE `trade_requests` (
  `trade_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `offered_item` text DEFAULT NULL,
  `offered_quantity` int(11) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trade_requests`
--

INSERT INTO `trade_requests` (`trade_id`, `product_id`, `from_user_id`, `to_user_id`, `offered_item`, `offered_quantity`, `address`, `phone`, `status`, `created_at`) VALUES
(14, 46, 1, 2, 'นน', 2, '99/66', '0918526474', 'rejected', '2026-06-04 20:58:36'),
(15, 48, 2, 1, 'ley', 1, '000/22', '0000000000', 'accepted', '2026-06-04 21:01:06');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `phone`, `address`, `created_at`) VALUES
(1, 'Thanawat Udcha', 'thnwathnxudcha@gmail.com', '$2b$10$vT5Lntl6x8k8ZQnQrEPKyuks4bUc8lx5tSO5JXV2yNM8Cyuclybgu', NULL, NULL, '2026-06-03 18:51:09'),
(2, 'Jeff', 'thnwatdcha@gmail.com', '$2b$10$JIbV4zXL8N/8Th3s.yYy3u1ZNmqLDpt/em0Sc6b6W1uVW8OITM/bK', NULL, NULL, '2026-06-04 06:31:40'),
(3, 'bom', 'bom@gmail.com', '$2b$10$dlFEH6vyKBoBxeMudIZDDuXmnq.X4E6DzGcVTygoLhDBgE/rD/Sxe', NULL, NULL, '2026-06-05 04:03:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trade_requests`
--
ALTER TABLE `trade_requests`
  ADD PRIMARY KEY (`trade_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `to_user_id` (`to_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `trade_requests`
--
ALTER TABLE `trade_requests`
  MODIFY `trade_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
