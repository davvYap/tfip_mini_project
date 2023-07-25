
use railway;

create table users(
	user_id varchar(50) not null,
    username varchar(255) not null,
    password varchar(255) not null,
    email varchar(255) not null,
    firstname varchar(255) not null,
    lastname varchar(255) not null,
    birthday date null,
    gender varchar(100),
    location varchar(100),
    occupation varchar(255),
    profile_pic longblob,
    primary key(user_id)
);

create table categories(
	cat_id int not null auto_increment,
    cat_name varchar(50) not null,
    type varchar(20) not null,
    user_id varchar(50) not null,
    primary key(cat_id),
    constraint fk_user_id
		foreign key (user_id) references users(user_id)
);

create table transactions(
	trans_id varchar(50) not null,
    trans_name varchar(100) not null,
    date_of_trans date not null,
    amount double not null,
    remarks varchar(200),
    user_id varchar(50) not null,
    cat_id int not null,
    primary key(trans_id),
    foreign key(user_id) references users(user_id),
    foreign key(cat_id) references categories(cat_id)
);

create table regular_transactions(
	regular_trans_id varchar(50) not null,
    trans_id varchar(50) not null,
    user_id varchar(50) not null,
    active boolean not null,
    primary key(regular_trans_id),
    foreign key(trans_id) references transactions(trans_id),
    foreign key(user_id) references users(user_id)
);

select * from users;
delete from users where user_id = 'b0b56db9';

