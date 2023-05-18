const LeagueName = (e) => {
    let name = '';
    switch (e) {
        case '日职联':
            name = '日本职业足球甲级联赛（J1）';
            break;
        case '德乙':
            name = '德国乙级联赛';
            break;
        case '英冠':
            name = '英格兰冠军联赛';
            break;
        case '英超':
            name = '英格兰足球超级联赛';
            break;
        case '荷甲':
            name = '荷兰足球甲级联赛';
            break;
        case '瑞典超':
            name = '瑞典超级联赛';
            break;
        case '德甲':
            name = '德国足球甲级联赛';
            break;
        case '葡超':
            name = '葡萄牙超级联赛';
            break;
        case '法甲':
            name = '法国足球甲级联赛';
            break;
        case '意甲':
            name = '意大利足球甲级联赛';
            break;
        case '西甲':
            name = '西班牙足球甲级联赛';
            break;
        default:
            name = e;
            break;
    }
    return name;
}


