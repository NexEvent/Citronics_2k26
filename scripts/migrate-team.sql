CREATE TABLE page_media (
    id BIGSERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    name TEXT,
    post TEXT,
    description TEXT,
    links TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO page_media (page, description, links)
VALUES ('about-citronics', 'Main promo video', 'bafybeifpqald5ng6zlwyn24sq67xnechnhexbxiblh233rkt6uusqcph7e');

-- 3. Insert team members
INSERT INTO page_media (page, name, post, description, links) VALUES
('team', 'Nakul Sameriya', 'President', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953430/Nakul_Sameriya_r3levr.png'),
('team', 'Dharmendra S. Thakur', 'Vice President', 'B.Pharmacy — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953428/dharmendra_thakur-Photoroom_qynq95.png'),
('team', 'Ishaan Menon', 'Vice President', 'MBA — 2nd Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Ishan_Menon-Photoroom_bzyfw5.png'),
('team', 'Harshita Sisodiya', 'Vice President', 'LAW — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Harshita_sisodiya_ezp9jm.jpg'),
('team', 'Jay Yadav', 'Vice President', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953431/Jay_Yadav_wkpcmg.jpg'),
('team', 'Aman Sharma', 'Vice President', 'BBA — 2nd Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953428/Aman_Sharma-Photoroom_sazdst.png'),
('team', 'Aadarsh Rathod', 'PRM', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953428/Aadarsh_Rathod_1_iazkp8.png'),
('team', 'Akshita Gupta', 'GS Management', 'MBA — 2nd Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Akshita_Gupta-Photoroom_dyx1mu.png'),
('team', 'Kirtan Gupta', 'GS Pharmacy', 'B.Pharmacy — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953430/Kirtan_Gupta-Photoroom_pl9zzi.png'),
('team', 'Vinay Jhadhav', 'GS Law', 'LAW — 6th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953430/Vinay_Jhadav-Photoroom_glnxkp.png'),
('team', 'Ayushi Patidar', 'GS Management', 'BBA — 2nd Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Aayushi_Patidar-Photoroom_jmvnuz.png'),
('team', 'Bhavesh Lone', 'GS Robotics', 'B.Tech — 8th Sem', NULL),
('team', 'Gourav Chorma', 'GS Mechanical & Civil', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Gourav_Chorma_esdynu.png'),
('team', 'Anisha Kanere', 'GS Creativity', 'B.Tech — 8th Sem', NULL),
('team', 'Aaditya Tanwar', 'GS Promotion', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953429/Aditya_tawar-Photoroom_mkyptd.png'),
('team', 'Pranay Thakur', 'GS Multi-Media', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953430/Pranay_Thakur-Photoroom_eyvh8u.png'),
('team', 'Priyank Thakur', 'GS E-Sports', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953430/Priyank_Thakur-Photoroom_jaafxn.png'),
('team', 'Aryan Gupta', 'GS Software', 'B.Tech — 8th Sem', 'https://res.cloudinary.com/djjboqxal/image/upload/v1772953428/Aryan_Gupta_GS-Photoroom_gx4l2f.png'),
('team', 'Aakash Barod', 'Discipline', 'MBA — 2nd Sem', NULL);