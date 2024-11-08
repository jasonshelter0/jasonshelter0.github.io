//=============================IE6的toFixed() Bug===================================
//==================================================================================
Number.prototype.toFixed = function (m) { //IE6.0的toFixed()有Bug,所以重写
  var n = this, f = '', p = Math.pow(10, m); //p为10进制移位量;
  if (n < 0) n = -n, f = '-';   //把负数转为正数
  var a = Math.floor(n), b = n - a; //分离整数与小数
  b = Math.round(b * p);      //移位并四舍五入
  if (b >= p) a++, b -= p;         //进位
  if (m) b = '.' + (p + b + '').substr(1, m); //小数部分左边补0
  else b = '';
  return f + a + b;
};
//=================================天文常数=========================================
//==================================================================================
var cs_rEar = 6378.1366; //地球赤道半径(千米)
var cs_rEarA = 0.99834 * cs_rEar; //平均半径
var cs_ba = 0.99664719; //地球极赤半径比
var cs_ba2 = cs_ba * cs_ba; //地球极赤半径比的平方
var cs_AU = 1.49597870691e8; //天文单位长度(千米)
var cs_sinP = cs_rEar / cs_AU;   //sin(太阳视差)
var cs_PI = Math.asin(cs_sinP); //太阳视差
var cs_GS = 299792.458; //光速(行米/秒)
var cs_Agx = cs_AU / cs_GS / 86400 / 36525; //每天文单位的光行时间(儒略世纪)
var cs_xxHH = new Array(116, 584, 780, 399, 378, 370, 367, 367); //行星会合周期
var xxName = new Array('地球', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星');
var rad = 180 * 3600 / Math.PI; //每弧度的角秒数
var radd = 180 / Math.PI; //每弧度的度数
var pi2 = Math.PI * 2;
var pi_2 = Math.PI / 2;
var J2000 = 2451545;

var cs_k = 0.2725076; //月亮与地球的半径比(用于半影计算)
var cs_k2 = 0.2722810; //月亮与地球的半径比(用于本影计算)
var cs_k0 = 109.1222;  //太阳与地球的半径比(对应959.64)
var cs_sMoon = cs_k * cs_rEar * 1.0000036 * rad;  //用于月亮视半径计算
var cs_sMoon2 = cs_k2 * cs_rEar * 1.0000036 * rad; //用于月亮视半径计算
var cs_sSun = 959.64; //用于太阳视半径计算

//=================================三角函数等=======================================
//==================================================================================
function int2(v) { return Math.floor(v); }  //取整数部分
function mod2(v, n) { return (v % n + n) % n; }  //求余
function sqrt(x) { return Math.sqrt(x); }
function floor(x) { return Math.floor(x); }
function abs(x) { return Math.abs(x); }
function sin(x) { return Math.sin(x); }
function cos(x) { return Math.cos(x); }
function tan(x) { return Math.tan(x); }
function asin(x) { return Math.asin(x); }
function acos(x) { return Math.acos(x); }
function atan(x) { return Math.atan(x); }
function atan2(y, x) { return Math.atan2(y, x); }

//=================================角度格式化=======================================
//==================================================================================
function rad2strE(d, tim, ext) { //将弧度转为字串,ext为小数保留位数
  //tim=0输出格式示例: -23°59' 48.23"
  //tim=1输出格式示例:  18h 29m 44.52s
  var s = " ";
  var w1 = "°", w2 = "'", w3 = '"';
  if (d < 0) d = -d, s = '-';
  if (tim) { d *= 12 / Math.PI; w1 = "h ", w2 = "m", w3 = "s"; }
  else d *= 180 / Math.PI;
  var a = Math.floor(d); d = (d - a) * 60;
  var b = Math.floor(d); d = (d - b) * 60;
  var c = Math.floor(d);

  var Q = Math.pow(10, ext);

  d = Math.floor((d - c) * Q + 0.5);
  if (d >= Q) d -= Q, c++;
  if (c >= 60) c -= 60, b++;
  if (b >= 60) b -= 60, a++;

  a = "   " + a, b = "0" + b, c = "0" + c, d = "00000" + d;
  s += a.substr(a.length - 3, 3) + w1;
  s += b.substr(b.length - 2, 2) + w2;
  s += c.substr(c.length - 2, 2);
  if (ext) s += "." + d.substr(d.length - ext, ext) + w3;
  return s;
}

function rad2str(d, tim) { return rad2strE(d, tim, 2); } //将弧度转为字串,保留2位

function rad2str2(d) { //将弧度转为字串,精确到分
  //输出格式示例: -23°59'
  var s = "+";
  var w1 = "°", w2 = "'", w3 = '"';
  if (d < 0) d = -d, s = '-';
  d *= 180 / Math.PI;
  var a = Math.floor(d);
  var b = Math.floor((d - a) * 60 + 0.5);
  if (b >= 60) b -= 60, a++;
  a = "   " + a, b = "0" + b;
  s += a.substr(a.length - 3, 3) + w1;
  s += b.substr(b.length - 2, 2) + w2;
  return s;
}
function m2fm(v, fx, fs) {//秒转为分秒,fx为小数点位数,fs为1转为"分秒"格式否则转为"角度分秒"格式
  var gn = '';
  if (v < 0) v = -v, gn = '-';
  var f = Math.floor(v / 60), m = v - f * 60;
  if (!fs) return gn + f + "'" + m.toFixed(fx) + '"';
  if (fs == 1) return gn + f + '分' + m.toFixed(fx) + '秒';
  if (fs == 2) return gn + f + 'm' + m.toFixed(fx) + 's';
}


function str2rad(s, f) { //串转弧度, f=1表示输入的s为时分秒
  var fh = 1;
  f = f ? 15 : 1;
  if (s.indexOf('-') != -1) fh = -1;
  s = s.replace(/h|m|s|(-)|(°)|\'|\"/g, ' ');
  s = s.replace(/ +/g, ' ');   //多个空格合并为1个空格
  s = s.replace(/(^\s*)|(\s*$)/g, ''); //去除前后空格
  s = s.split(' ');
  return fh * (s[0] * 3600 + s[1] * 60 + s[2] * 1) / rad * f;
}

/*
function str2rad(s,f){ //串转弧度, f=1表示输入的s为时分秒。为也与flash as2兼容所以不用replace
 var fh=1,i,c,c2='',v=new Array();
 if(s.indexOf('-')!=-1) fh = -1;
 for(i=0;i<s.length;i++){
   c=s.substr(i,1);
   if(c=='h'||c=='m'||c=='s'||c=='-'||c=='°'||c=='"'||c=="'"||c==' '){
    if(c2!='') v[v.length]=c2-0;
    c2='';
   } else c2+=c;
 }
 if(c2!='') v[v.length]=c2-0;
 while(v.length<3) v[v.length]=0;
 f = f ? 15 : 1;
 return fh*(v[0]*3600+v[1]*60+v[2]*1)/rad*f;
}
*/
//=================================数学工具=========================================
//==================================================================================

function rad2mrad(v) { //对超过0-2PI的角度转为0-2PI
  v = v % (2 * Math.PI);
  if (v < 0) return v + 2 * Math.PI;
  return v;
}
function rad2rrad(v) {//对超过-PI到PI的角度转为-PI到PI
  v = v % (2 * Math.PI);
  if (v <= -Math.PI) return v + 2 * Math.PI;
  if (v > Math.PI) return v - 2 * Math.PI;
  return v;
}
// function mod2(a,b){ //临界余数(a与最近的整倍数b相差的距离)
//   var c=a/b;
//   c -= Math.floor(c);
//   if(c>0.5) c-=1;
//   return c*b;
// }
//#4 下面是hetai9z优化后的函数,简洁快速:
function mod2(a, b) { //临界余数(a与最近的整倍数b相差的距离)
  let c = (a + b) % b
  if (c > b / 2.0) c -= b
  return c;
}

function llr2xyz(JW) { //球面转直角坐标
  var r = new Array(), J = JW[0], W = JW[1], R = JW[2];
  r[0] = R * cos(W) * cos(J);
  r[1] = R * cos(W) * sin(J);
  r[2] = R * sin(W);
  return r;
}
function xyz2llr(xyz) { //直角坐标转球
  var r = new Array(), x = xyz[0], y = xyz[1], z = xyz[2];
  r[2] = sqrt(x * x + y * y + z * z);
  r[1] = asin(z / r[2]);
  r[0] = rad2mrad(atan2(y, x));
  return r;
}

function llrConv(JW, E) { //球面坐标旋转
  //黄道赤道坐标变换,赤到黄E取负
  var r = new Array(), J = JW[0], W = JW[1];
  r[0] = atan2(sin(J) * cos(E) - tan(W) * sin(E), cos(J));
  r[1] = asin(cos(E) * sin(W) + sin(E) * cos(W) * sin(J));
  r[2] = JW[2];
  r[0] = rad2mrad(r[0]);
  return r;
}
function CD2DP(z, L, fa, gst) { //赤道坐标转为地平坐标
  var a = new Array(z[0] + Math.PI / 2 - gst - L, z[1], z[2]);  //转到相对于地平赤道分点的赤道坐标
  a = llrConv(a, Math.PI / 2 - fa);
  a[0] = rad2mrad(Math.PI / 2 - a[0]);
  return a;
}
function j1_j2(J1, W1, J2, W2) { //求角度差
  var dJ = rad2rrad(J1 - J2), dW = W1 - W2;
  if (Math.abs(dJ) < 1 / 1000 && Math.abs(dW) < 1 / 1000) {
    dJ *= Math.cos((W1 + W2) / 2);
    return Math.sqrt(dJ * dJ + dW * dW);
  }
  return Math.acos(Math.sin(W1) * Math.sin(W2) + Math.cos(W1) * Math.cos(W2) * Math.cos(dJ));
}
function h2g(z, a) { //日心球面转地心球面,Z星体球面坐标,A地球球面坐标
  //本含数是通用的球面坐标中心平移函数,行星计算中将反复使用
  a = llr2xyz(a); //地球
  z = llr2xyz(z); //星体
  z[0] -= a[0]; z[1] -= a[1]; z[2] -= a[2];
  return xyz2llr(z);
}

function shiChaJ(gst, L, fa, J, W) { //视差角(不是视差)
  var H = gst + L - J; //天体的时角
  return rad2mrad(atan2(sin(H), tan(fa) * cos(W) - sin(W) * cos(H)));
}

//=================================deltat T计算=====================================
//==================================================================================

var dt_at = new Array( // TD - UT1 计算表
  -4000, 108371.7, -13036.80, 392.000, 0.0000,
  -500, 17201.0, -627.82, 16.170, -0.3413,
  -150, 12200.6, -346.41, 5.403, -0.1593,
  150, 9113.8, -328.13, -1.647, 0.0377,
  500, 5707.5, -391.41, 0.915, 0.3145,
  900, 2203.4, -283.45, 13.034, -0.1778,
  1300, 490.1, -57.35, 2.085, -0.0072,
  1600, 120.0, -9.81, -1.532, 0.1403,
  1700, 10.2, -0.91, 0.510, -0.0370,
  1800, 13.4, -0.72, 0.202, -0.0193,
  1830, 7.8, -1.81, 0.416, -0.0247,
  1860, 8.3, -0.13, -0.406, 0.0292,
  1880, -5.4, 0.32, -0.183, 0.0173,
  1900, -2.3, 2.06, 0.169, -0.0135,
  1920, 21.2, 1.69, -0.304, 0.0167,
  1940, 24.2, 1.22, -0.064, 0.0031,
  1960, 33.2, 0.51, 0.231, -0.0109,
  1980, 51.0, 1.29, -0.026, 0.0032,
  2000, 63.87, 0.1, 0, 0,
  2005, 64.7, 0.21, 0, 0,
  2012, 66.8, 0.22, 0, 0,
  2018, 69.0, 0.36, 0, 0,
  2028, 72.6
);

function dt_ext(y, jsd) { var dy = (y - 1820) / 100; return -20 + jsd * dy * dy; } //二次曲线外推

function dt_calc(y) { //计算世界时与原子时之差,传入年
  var y0 = dt_at[dt_at.length - 2]; //表中最后一年
  var t0 = dt_at[dt_at.length - 1]; //表中最后一年的deltatT
  if (y >= y0) {
    var jsd = 31; //sjd是y1年之后的加速度估计。瑞士星历表jsd=31,NASA网站jsd=32,skmap的jsd=29
    if (y > y0 + 100) return dt_ext(y, jsd);
    var v = dt_ext(y, jsd);       //二次曲线外推
    var dv = dt_ext(y0, jsd) - t0;  //ye年的二次外推与te的差
    return v - dv * (y0 + 100 - y) / 100;
  }
  var i, d = dt_at;
  for (i = 0; i < d.length; i += 5) if (y < d[i + 5]) break;
  var t1 = (y - d[i]) / (d[i + 5] - d[i]) * 10, t2 = t1 * t1, t3 = t2 * t1;
  return d[i + 1] + d[i + 2] * t1 + d[i + 3] * t2 + d[i + 4] * t3;
}

function dt_T(t) { return dt_calc(t / 365.2425 + 2000) / 86400.0; }  //传入儒略日(J2000起算),计算TD-UT(单位:日)

//=================================日期计算--=======================================
//==================================================================================
var JD = { //日期元件
  JD: function (y, m, d) { //公历转儒略日
    y = Number(y);
    m = Number(m);
    d = Number(d);
    var n = 0, G = 0;
    if (y * 372 + m * 31 + int2(d) >= 588829) G = 1; //判断是否为格里高利历日1582*372+10*31+15
    if (m <= 2) m += 12, y--;
    if (G) n = int2(y / 100), n = 2 - n + int2(n / 4); //加百年闰
    return int2(365.25 * (y + 4716)) + int2(30.6001 * (m + 1)) + d + n - 1524.5;
  },
  JDarr: function ([y, m, d]) { //公历转儒略日
    y = Number(y);
    m = Number(m);
    d = Number(d);
    var n = 0, G = 0;
    if (y * 372 + m * 31 + int2(d) >= 588829) G = 1; //判断是否为格里高利历日1582*372+10*31+15
    if (m <= 2) m += 12, y--;
    if (G) n = int2(y / 100), n = 2 - n + int2(n / 4); //加百年闰
    return int2(365.25 * (y + 4716)) + int2(30.6001 * (m + 1)) + d + n - 1524.5;
  },
  DD: function (jd) { //儒略日数转公历
    var r = new Object();
    var D = int2(jd + 0.5), F = jd + 0.5 - D, c;  //取得日数的整数部份A及小数部分F
    if (D >= 2299161) c = int2((D - 1867216.25) / 36524.25), D += 1 + c - int2(c / 4);
    D += 1524; r.Y = int2((D - 122.1) / 365.25);//年数
    D -= int2(365.25 * r.Y); r.M = int2(D / 30.601); //月数
    D -= int2(30.601 * r.M); r.D = D; //日数
    if (r.M > 13) r.M -= 13, r.Y -= 4715;
    else r.M -= 1, r.Y -= 4716;
    //日的小数转为时分秒
    F *= 24; r.h = int2(F); F -= r.h;
    F *= 60; r.m = int2(F); F -= r.m;
    F *= 60; r.s = F;
    return r;
  },
  DD2str: function (r) { //日期转为串
    var Y = "     " + r.Y, M = "0" + r.M, D = "0" + r.D;
    var h = r.h, m = r.m, s = int2(r.s + .5);
    if (s >= 60) s -= 60, m++;
    if (m >= 60) m -= 60, h++;
    h = "0" + h; m = "0" + m; s = "0" + s;
    Y = Y.substr(Y.length - 5, 5); M = M.substr(M.length - 2, 2); D = D.substr(D.length - 2, 2);
    h = h.substr(h.length - 2, 2); m = m.substr(m.length - 2, 2); s = s.substr(s.length - 2, 2);
    return Y + "." + M + "." + D + " " + h + ":" + m + ":" + s;
  },
  SD: function (sdrb) { // 儒略日数转SDRB日
    return sdrb + 2460121.5;
  },
  DS: function (js) { // SDRB日转儒略日数
    return js - 2460121.5;
  },
  JS: function (y, m, d) { // 公历转SDRB日
    return this.DS(this.JD(y, m, d));
  },
  SJ: function (sdrb) {
    var r = this.DD(this.SD(sdrb));
    return [r.Y, r.M, r.D];
  },
  JD2str: function (jd) { //JD转为串
    var r = this.DD(jd);
    return this.DD2str(r);
  },
  JN: function (y, m, d) { //公历转新历
    // document.write("Hey!!!")
    var ny, nm, nd, jCP0, jTgt, gCP1, gCP2, gCP3, gCP4, gCPp, idx;
    gCP1 = String(gCheckPoint(y, 1));
    gCP2 = String(gCheckPoint(y, 2));
    gCP3 = String(gCheckPoint(y, 3));
    gCP4 = String(gCheckPoint(y, 4));
    gCPp = String(gCheckPoint(y - 1, 4));
    var arrCP = [gCPp, gCP1, gCP2, gCP3, gCP4];
    var arr = [this.JD(Number(gCPp.split('.')[0]), Number(gCPp.split('.')[1]), Number(gCPp.split('.')[2])), this.JD(Number(gCP1.split('.')[0]), Number(gCP1.split('.')[1]), Number(gCP1.split('.')[2])), this.JD(Number(gCP2.split('.')[0]), Number(gCP2.split('.')[1]), Number(gCP2.split('.')[2])), this.JD(Number(gCP3.split('.')[0]), Number(gCP3.split('.')[1]), Number(gCP3.split('.')[2])), this.JD(Number(gCP4.split('.')[0]), Number(gCP4.split('.')[1]), Number(gCP4.split('.')[2]))]
    jTgt = Number(this.JD(y, m, d));
    idx = this.findIndex(arr, jTgt);
    var arrT = [y - (idx == 1), idx - (idx >= 2) + 3 * (idx == 1)];
    var gCP0 = arrCP[idx - 1];
    jCP0 = arr[idx - 1];
    nd = jTgt - jCP0 + 1;
    var arrN = this.TN(arrT);
    ny = arrN[0];
    nm = arrN[1];
    return [ny, nm, nd]
  },
  NJ: function (ny, nm, nd) { //新历转公历
    var arrN = this.NT([ny, nm]);
    var y = arrN[0];
    var tgt = arrN[1];
    var gCP0 = this.T2gCP(arrN);
    var jCP0 = this.JD(Number(gCP0.split('.')[0]), Number(gCP0.split('.')[1]), Number(gCP0.split('.')[2]))
    var jTgt = jCP0 + nd - 1;
    var gDate = this.DD(jTgt);
    var gy = gDate.Y;
    var gm = gDate.M;
    var gd = gDate.D;
    return [gy, gm, gd];
  },
  TN: function (arrT) { //(y, tgt) -> (ny, nm)
    var y = arrT[0];
    var tgt = arrT[1];
    var ny = int2((y - 2013) / 4) + 1;
    var nm = (y - 2013 - 4 * int2((y - 2013) / 4)) * 4 + tgt;
    nm -= (ny == 2 && nm >= 12);
    return [ny, nm];
  },
  NT: function (arrN) { //(ny, nm) -> (y, tgt)
    var ny = Number(arrN[0]);
    var nm = Number(arrN[1]);
    var y = 2013 + 4 * (ny - 1) + int2((nm - 1) / 4) + (ny == 2 && nm == 12);
    var tgt = nm - int2((nm - 1) / 4) * 4 + (ny == 2 && nm >= 13) - 3 * (ny == 2 && nm == 12);
    return [y, tgt];
  },
  isValid: function (arrN) { //判断(ny, nm)是否有效
    var ny = Number(arrN[0]);
    var nm = Number(arrN[1]);
    if (ny <= -1000 || ny >= 999) return false;
    if (nm <= 0 || nm >= 17) return false;
    if (ny == 2 && nm == 16) return false;
    return true;
  },
  T2gCP: function (arrT) { //gCP点生成
    var y = Number(arrT[0]);
    var tgt = Number(arrT[1]); // bug赏析： arrT写成arr。 傻子。
    var i, j, s = '', s1, s2, v, v2, qi, gW, m = 1;
    if (y == 2024 && tgt == 4) return '2024.11.03';
    else if (y == 2021 && tgt == 3) return '2021.08.01';
    else if (y == 2021 && tgt == 4) return '2021.10.31';
    else if (y == 2019 && tgt == 4) return '2019.11.10';
    else {
      m = (tgt - 1) * 6 + (y >= 2020) * 3 + (y <= 2019) * 6 + (y == 2019 && tgt == 3) * 3 + (y <= 2019 && tgt == 4) * -24;
      if (y <= 2019 && tgt == 4) y += 1;
      SSQ.calcY(int2((y - 2000) * 365.2422 + 180));
      for (i = 0; i < 14; i++) {
        if (SSQ.HS[i + 1] > SSQ.ZQ[24]) break; //已包含下一年的冬至
        // if (SSQ.leap && i == SSQ.leap) s1t = '闰'; else s1t = '·';
        s1 = ''
        v = SSQ.HS[i] + J2000;
        for (j = -2; j < 24; j++) {
          if (j >= 0) qi = SSQ.ZQ[j];
          if (j == -1) qi = SSQ.ZQ.pe1;
          if (j == -2) qi = SSQ.ZQ.pe2;

          if (qi < SSQ.HS[i] || qi >= SSQ.HS[i + 1]) continue;
          gW = JD.getWeek(qi + J2000);
          v2 = qi + J2000 + (y >= 2020 || (y == 2019 && tgt == 3)) * ((gW >= 4) * 7 - gW);
          if ((j + 24) % 24 == m) s1 += JD.JD2str(v2).substr(0, 11) // + '   ' + gW;
        }
        s += s1 // + '<br>';
      }
      return s;
    }
  },
  getNCNextMonth: function (arrThisNC) { // (ny1, nm1) -> next? (ny2, nm2)
    var nyThis = Number(arrThisNC[0]);
    var nmThis = Number(arrThisNC[1]);
    var nmNext = nmThis + 1;
    var nyNext = nyThis;
    if ((nyThis == 2 && nmThis == 15) || nmThis == 16) {
      nmNext = 1;
      nyNext += 1;
    }
    return [nyNext, nmNext];
  },
  getNCMonthLength: function (arrThisNC) { //获取给定新历年月的月长度
    var nyThis = Number(arrThisNC[0]);
    var nmThis = Number(arrThisNC[1]);
    var arrNextNC = this.getNCNextMonth([nyThis, nmThis]);
    var nyNext = Number(arrNextNC[0]);
    var nmNext = Number(arrNextNC[1]);
    return this.JDarr(this.NJ(nyNext, nmNext, 1)) - this.JDarr(this.NJ(nyThis, nmThis, 1))
  }, 
  getLunarInfo: function (arrL) { // UNUSED
    var gy = Number(arrL[0]);
    var gm = Number(arrL[1]);
    var gd = Number(arrL[2]);
  },
  findIndex: function (arr, num) {
    var left = 0;
    var right = arr.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] === num) {
        return mid + 1;
      } else if (arr[mid] < num) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return left;
  },

  Y: 2000, M: 1, D: 1, h: 12, m: 0, s: 0,
  toJD: function () { return this.JD(this.Y, this.M, this.D + ((this.s / 60 + this.m) / 60 + this.h) / 24); }, //公历转儒略日
  setFromJD: function (jd) { var r = this.DD(jd); this.Y = r.Y, this.M = r.M, this.D = r.D, this.m = r.m, this.h = r.h, this.s = r.s; }, //儒略日数转公历

  timeStr: function (jd) { //提取jd中的时间(去除日期)
    var h, m, s;
    jd += 0.5; jd = (jd - int2(jd));
    s = int2(jd * 86400 + 0.5);
    h = int2(s / 3600); s -= h * 3600;
    m = int2(s / 60); s -= m * 60;
    h = "0" + h; m = "0" + m; s = "0" + s;
    return h.substr(h.length - 2, 2) + ':' + m.substr(m.length - 2, 2) + ':' + s.substr(s.length - 2, 2);
  },
  //星期相关
  Weeks: new Array('日', '一', '二', '三', '四', '五', '六', '七'),
  WeeksEng: new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'),
  nums: new Array('零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万'), //中文数字
  chnNumChar: new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九"),
  chnUnitSection: new Array("", "万", "亿", "万亿", "亿亿"),
  chnUnitChar: new Array("", "十", "百", "千"),
  getWeek: function (jd) { return int2(jd + 1.5 + 7000000) % 7 }, //星期计算
  nnweek: function (y, m, n, w) { //求y年m月的第n个星期w的儒略日数
    var jd = JD.JD(y, m, 1.5); //月首儒略日
    var w0 = (jd + 1 + 7000000) % 7;       //月首的星期
    var r = jd - w0 + 7 * n + w;    //jd-w0+7*n是和n个星期0,起算下本月第一行的星期日(可能落在上一月)。加w后为第n个星期w
    if (w >= w0) r -= 7; //第1个星期w可能落在上个月,造成多算1周,所以考虑减1周
    if (n == 5) {
      m++; if (m > 12) m = 1, y++;   //下个月
      if (r >= JD.JD(y, m, 1.5)) r -= 7; //r跑到下个月则减1周
    }
    return r;
  },
  toChineseNum: function (num) { // UNUSED
    let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let unit = ["", "十", "百", "千", "万"];
    num = parseInt(num);
    let getWan = (temp) => {
      let strArr = temp.toString().split("").reverse();
      let newNum = "";
      for (var i = 0; i < strArr.length; i++) {
        newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
      }
      return newNum;
    }
    let overWan = Math.floor(num / 10000);
    let noWan = num % 10000;
    if (noWan.toString().length < 4) { noWan = "0" + noWan; }
    return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
  },
  // 节内转换算法
  SectionToChinese: function (section) {
    var strIns = '', chnStr = '';
    var unitPos = 0;
    var zero = true;
    while (section > 0) {
      var v = section % 10;
      if (v === 0) {
        if (!zero) {
          zero = true;
          chnStr = this.chnNumChar[v] + chnStr;
        }
      } else {
        zero = false;
        strIns = this.chnNumChar[v];
        strIns += this.chnUnitChar[unitPos];
        chnStr = strIns + chnStr;
      }
      unitPos++;
      section = Math.floor(section / 10);
    }
    return chnStr;
  },
  // 转换算法主函数
  NumberToChinese: function (num, nyFlag) {
    var unitPos = 0;
    var strIns = '', chnStr = '', chnPreStr='';
    var needZero = false;
    var special = (num >= 10 && num <= 19);
    if (nyFlag == 1 && num == 1) return "元";
    // document.write("Yep! Num=" + num + ' ');
    if (num == 0) {
      return this.chnNumChar[0];
    }
    if (num < 0&& nyFlag == 0) {
      chnPreStr = "负";
      num *= -1;
    }
    if (num < 0&& nyFlag == 1) {
      chnPreStr = "前";
      num *= -1;
    }
    while (num > 0) {
      var section = num % 10000;
      if (needZero) {
        chnStr = this.chnNumChar[0] + chnStr;
      }
      strIns = this.SectionToChinese(section);
      strIns += (section !== 0) ? this.chnUnitSection[unitPos] : this.chnUnitSection[0];
      chnStr = strIns + chnStr;
      needZero = (section < 1000) && (section > 0);
      num = Math.floor(num / 10000);
      unitPos++;
    }
    if (special == true) return chnStr.slice(1);
    return chnPreStr + chnStr;
  },
  JgetWeekName: function (y, m, d) {
    // document.write(JD.JD(y, m, d) + 1.5 + 7000000)
    // document.write(JD.getWeek(JD.JD(y, m, d)))
    return '星期' + this.Weeks[this.getWeek(this.JD(y, m, d))];
  },
  JgetWeekEngName: function (y, m, d) {
    return this.WeeksEng[this.getWeek(this.JD(y, m, d))];
  },
  JgetSCOSSLOPInfoArr: function (y, m, d) {
    var jd = JD.JD(y, m, d);
    var jdFirstSCOSSLOP = -141 + 2460121.5; // 03-09-01(2023.02.05)
    if (jd < jdFirstSCOSSLOP) return [0,0];
    var idx = 1 + int2((-jdFirstSCOSSLOP + jd) / 63);
    var idxW = int2((- jdFirstSCOSSLOP - (idx - 1) * 63 + jd) / 7) + 1;
    return [idx, idxW]
  },
  JgetSCOSSLOPSeq: function (y, m, d) {
    var jd = JD.JD(y, m, d);
    var jdFirstSCOSSLOP = -141 + 2460121.5; // 03-09-01(2023.02.05)
    if (jd < jdFirstSCOSSLOP) return '[新九周计划未开始]';
    var idx = 1 + int2((-jdFirstSCOSSLOP + jd) / 63);
    var idxW = int2((- jdFirstSCOSSLOP - (idx - 1) * 63 + jd) / 7) + 1;
    if (idx < 21) return '新' + this.NumberToChinese(idx, 0) + '九第' + this.NumberToChinese(idxW, 0) + '周';
    else return this.NumberToChinese(idx, 0) + '九第' + this.NumberToChinese(idxW, 0) + '周';
  },
  JgetSCOSSLOPSeqEng: function (y, m, d) {
    var jd = JD.JD(y, m, d);
    var jdFirstSCOSSLOP = -141 + 2460121.5; // 03-09-01(2023.02.05)
    if (jd < jdFirstSCOSSLOP) return '[No SCOSSLOPs arranged]';
    var idx = 1 + int2((- jdFirstSCOSSLOP + jd) / 63);
    var idxW = int2((- jdFirstSCOSSLOP - (idx - 1) * 63 + jd) / 7) + 1;
    return 'SCOSSLOP-' + idx.toString().padStart(3, '0') + ', week' + idxW.toString();
  },
  JgetSemWeekSeq: function (y, m, d, y0, m0, d0, weekLength, semName) {
    var jd = JD.JD(y, m, d);
    var jdS = JD.JD(y0, m0, d0); // 学期开始日(必须是学期第一天且为周天 否则会出错)
    var jdE = jdS + 7 * weekLength; // 学期结束日W
    if (jd < jdS) return '[' + semName + '学期未开始]';
    if (jd > jdE) return '[' + semName + '学期已结束]';
    var idx = 1 + int2((jd - jdS) / 7);
    return semName + '学期第' + this.NumberToChinese(idx, 0) + '周';
  },
  JgetSemWeekSeqEng: function (y, m, d, y0, m0, d0) {
    var jd = JD.JD(y, m, d);
    var jdS = JD.JD(y0, m0, d0); // 学期开始日(必须是学期第一天且为周天 否则会出错)
    var jdE = jdS + 7 * weekLength; // 学期结束日
    if (jd < jdS) return '[8th Semester not started yet]';
    if (jd > jdE) return '[8th Semester ended]';
    var idx = 1 + int2((jd - jdS) / 7);
    return '8th Sem Week ' + idx.toString().padStart(2, '0');
  },
};

function gDateComp(gDate1, gDate2) { // returns gDate1 is earlier than gDate2
  var gy1, gm1, gd1, gy2, gm2, gd2;
  gDate1 = String(gDate1).replace(/[^0-9:\.]/g, '');
  gDate2 = String(gDate2).replace(/[^0-9:\.]/g, '');
  gy1 = gDate1.split('.')[0];
  gm1 = gDate1.split('.')[1];
  gd1 = gDate1.split('.')[2];
  gy2 = gDate2.split('.')[0];
  gm2 = gDate2.split('.')[1];
  gd2 = gDate2.split('.')[2];
  return ((gy1 < gy2) || (gy1 == gy2 && gm1 < gm2) || (gy1 == gy2 && gm1 == gm2 && gd1 < gd2))
}





//=================================岁差计算=========================================
//==================================================================================
var preceTab_IAU1976 = new Array( //IAU1976岁差表
  0, 5038.7784, -1.07259, -0.001147, //fi
  84381.448, 0, +0.05127, -0.007726, //w
  0, +4.1976, +0.19447, -0.000179, //P
  0, -46.8150, +0.05059, +0.000344, //Q
  84381.448, -46.8150, -0.00059, +0.001813, //E
  0, +10.5526, -2.38064, -0.001125, //x
  0, 47.0028, -0.03301, +0.000057, //pi(自导出),根据P=sin(pi)*sin(II)
  629554.886, -869.8192, +0.03666, -0.001504, //II(自导出),根据Q=sin(pi)*cos(II)
  0, 5029.0966, +1.11113, +0.000006, //p
  0, 2004.3109, -0.42665, -0.041833, //th
  0, 2306.2181, +0.30188, +0.017998, //Z
  0, 2306.2181, +1.09468, +0.018203  //z	
);

var preceTab_IAU2000 = new Array( //IAU2000岁差表
  0, 5038.478750, -1.07259, -0.001147, 0, 0, //fi
  84381.448, -0.025240, +0.05127, -0.007726, 0, 0, //w,
  0, +4.1976, +0.19447, -0.000179, 0, 0, //P,
  0, -46.8150, +0.05059, +0.000344, 0, 0, //Q,
  84381.448, -46.84024, -0.00059, +0.001813, 0, 0, //E,
  0, +10.5526, -2.38064, -0.001125, 0, 0, //x
  0, 47.0028, -0.03301, +0.000057, 0, 0, //pi(自导出)
  629554.886, -869.8192, +0.03666, -0.001504, 0, 0, //II(自导出)
  0, 5028.79695, +1.11113, +0.000006, 0, 0, //p
  0, 2004.1917476, -0.4269353, -0.0418251, -0.0000601, -0.0000001, //th
  +2.5976176, 2306.0809506, +0.3019015, +0.0179663, -0.0000327, -0.0000002, //Z
  -2.5976176, 2306.0803226, +1.0947790, +0.0182273, +0.0000470, -0.0000003  //z
);

var preceTab_P03 = new Array(
  0, 5038.481507, -1.0790069, -0.00114045, +0.000132851, -9.51e-8,  //fi
  84381.406000, -0.025754, +0.0512623, -0.00772503, -4.67e-7, +3.337e-7, //w
  0, 4.199094, +0.1939873, -0.00022466, -9.12e-7, +1.20e-8,  //P
  0, -46.811015, +0.0510283, +0.00052413, -6.46e-7, -1.72e-8,  //Q
  84381.406000, -46.836769, -0.0001831, +0.00200340, -5.76e-7, -4.34e-8,  //E
  0, 10.556403, -2.3814292, -0.00121197, +0.000170663, -5.60e-8,  //x
  0, 46.998973, -0.0334926, -0.00012559, +1.13e-7, -2.2e-9,   //pi
  629546.7936, -867.95758, +0.157992, -0.0005371, -0.00004797, +7.2e-8,   //II
  0, 5028.796195, +1.1054348, +0.00007964, -0.000023857, +3.83e-8,  //p
  0, 2004.191903, -0.4294934, -0.04182264, -7.089e-6, -1.274e-7, //th
  2.650545, 2306.083227, +0.2988499, +0.01801828, -5.971e-6, -3.173e-7, //Z
  -2.650545, 2306.077181, +1.0927348, +0.01826837, -0.000028596, -2.904e-7  //z
);

function prece(t, sc, mx) { //t是儒略世纪数,sc是岁差量名称,mx是模型
  var i, tn = 1, c = 0, p, n;
  if (mx == 'IAU1976') n = 4, p = preceTab_IAU1976;
  if (mx == 'IAU2000') n = 6, p = preceTab_IAU2000;
  if (mx == 'P03') n = 6, p = preceTab_P03;
  sc = String("fi w  P  Q  E  x  pi II p  th Z  z ").indexOf(sc + ' ') / 3;
  for (i = 0; i < n; i++, tn *= t) c += p[sc * n + i] * tn;
  return c / rad;
}
function hcjj(t) { //返回P03黄赤交角,t是世纪数
  var t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t;
  return (84381.4060 - 46.836769 * t - 0.0001831 * t2 + 0.00200340 * t3 - 5.76e-7 * t4 - 4.34e-8 * t5) / rad;
}

//=================================岁差旋转=========================================
//==================================================================================
function CDllr_J2D(t, llr, mx) { //J2000赤道转Date赤道
  var Z = prece(t, 'Z', mx) + llr[0];
  var z = prece(t, 'z', mx);
  var th = prece(t, 'th', mx);
  var cosW = cos(llr[1]), cosH = cos(th);
  var sinW = sin(llr[1]), sinH = sin(th);
  var A = cosW * sin(Z);
  var B = cosH * cosW * cos(Z) - sinH * sinW;
  var C = sinH * cosW * cos(Z) + cosH * sinW;
  return new Array(rad2mrad(atan2(A, B) + z), asin(C), llr[2]);
}
function CDllr_D2J(t, llr, mx) { //Date赤道转J2000赤道
  var Z = -prece(t, 'z', mx) + llr[0];
  var z = -prece(t, 'Z', mx);
  var th = -prece(t, 'th', mx);
  var cosW = cos(llr[1]), cosH = cos(th);
  var sinW = sin(llr[1]), sinH = sin(th);
  var A = cosW * sin(Z);
  var B = cosH * cosW * cos(Z) - sinH * sinW;
  var C = sinH * cosW * cos(Z) + cosH * sinW;
  return new Array(rad2mrad(atan2(A, B) + z), asin(C), llr[2]);
}
function HDllr_J2D(t, llr, mx) {//黄道球面坐标_J2000转Date分点,t为儒略世纪数
  //J2000黄道旋转到Date黄道(球面对球面),也可直接由利用球面旋转函数计算,但交角接近为0时精度很低
  var r = new Array(llr[0], llr[1], llr[2]);
  r[0] += prece(t, 'fi', mx); r = llrConv(r, prece(t, 'w', mx));
  r[0] -= prece(t, 'x', mx); r = llrConv(r, -prece(t, 'E', mx));
  return r;
}
function HDllr_D2J(t, llr, mx) {//黄道球面坐标_Date分点转J2000,t为儒略世纪数
  var r = new Array(llr[0], llr[1], llr[2]);
  r = llrConv(r, prece(t, 'E', mx)); r[0] += prece(t, 'x', mx);
  r = llrConv(r, -prece(t, 'w', mx)); r[0] -= prece(t, 'fi', mx);
  r[0] = rad2mrad(r[0]);
  return r;
}

//=================================章动计算=========================================
//==================================================================================
var nuTab = new Array( //IAU2000B章动序列
  //l  l' F  D  Om         A        A'      A"        B      B'     B"
  0, 0, 0, 0, 1, -172064161, -174666, 33386, 92052331, 9086, 15377,
  0, 0, 2, -2, 2, -13170906, -1675, -13696, 5730336, -3015, -4587,
  0, 0, 2, 0, 2, -2276413, -234, 2796, 978459, -485, 1374,
  0, 0, 0, 0, 2, 2074554, 207, -698, -897492, 470, -291,
  0, 1, 0, 0, 0, 1475877, -3633, 11817, 73871, -184, -1924,
  0, 1, 2, -2, 2, -516821, 1226, -524, 224386, -677, -174,
  1, 0, 0, 0, 0, 711159, 73, -872, -6750, 0, 358,
  0, 0, 2, 0, 1, -387298, -367, 380, 200728, 18, 318,
  1, 0, 2, 0, 2, -301461, -36, 816, 129025, -63, 367,
  0, -1, 2, -2, 2, 215829, -494, 111, -95929, 299, 132,

  0, 0, 2, -2, 1, 128227, 137, 181, -68982, -9, 39,
  -1, 0, 2, 0, 2, 123457, 11, 19, -53311, 32, -4,
  -1, 0, 0, 2, 0, 156994, 10, -168, -1235, 0, 82,
  1, 0, 0, 0, 1, 63110, 63, 27, -33228, 0, -9,
  -1, 0, 0, 0, 1, -57976, -63, -189, 31429, 0, -75,
  -1, 0, 2, 2, 2, -59641, -11, 149, 25543, -11, 66,
  1, 0, 2, 0, 1, -51613, -42, 129, 26366, 0, 78,
  -2, 0, 2, 0, 1, 45893, 50, 31, -24236, -10, 20,
  0, 0, 0, 2, 0, 63384, 11, -150, -1220, 0, 29,
  0, 0, 2, 2, 2, -38571, -1, 158, 16452, -11, 68,

  0, -2, 2, -2, 2, 32481, 0, 0, -13870, 0, 0,
  -2, 0, 0, 2, 0, -47722, 0, -18, 477, 0, -25,
  2, 0, 2, 0, 2, -31046, -1, 131, 13238, -11, 59,
  1, 0, 2, -2, 2, 28593, 0, -1, -12338, 10, -3,
  -1, 0, 2, 0, 1, 20441, 21, 10, -10758, 0, -3,
  2, 0, 0, 0, 0, 29243, 0, -74, -609, 0, 13,
  0, 0, 2, 0, 0, 25887, 0, -66, -550, 0, 11,
  0, 1, 0, 0, 1, -14053, -25, 79, 8551, -2, -45,
  -1, 0, 0, 2, 1, 15164, 10, 11, -8001, 0, -1,
  0, 2, 2, -2, 2, -15794, 72, -16, 6850, -42, -5,

  0, 0, -2, 2, 0, 21783, 0, 13, -167, 0, 13,
  1, 0, 0, -2, 1, -12873, -10, -37, 6953, 0, -14,
  0, -1, 0, 0, 1, -12654, 11, 63, 6415, 0, 26,
  -1, 0, 2, 2, 1, -10204, 0, 25, 5222, 0, 15,
  0, 2, 0, 0, 0, 16707, -85, -10, 168, -1, 10,
  1, 0, 2, 2, 2, -7691, 0, 44, 3268, 0, 19,
  -2, 0, 2, 0, 0, -11024, 0, -14, 104, 0, 2,
  0, 1, 2, 0, 2, 7566, -21, -11, -3250, 0, -5,
  0, 0, 2, 2, 1, -6637, -11, 25, 3353, 0, 14,
  0, -1, 2, 0, 2, -7141, 21, 8, 3070, 0, 4,

  0, 0, 0, 2, 1, -6302, -11, 2, 3272, 0, 4,
  1, 0, 2, -2, 1, 5800, 10, 2, -3045, 0, -1,
  2, 0, 2, -2, 2, 6443, 0, -7, -2768, 0, -4,
  -2, 0, 0, 2, 1, -5774, -11, -15, 3041, 0, -5,
  2, 0, 2, 0, 1, -5350, 0, 21, 2695, 0, 12,
  0, -1, 2, -2, 1, -4752, -11, -3, 2719, 0, -3,
  0, 0, 0, -2, 1, -4940, -11, -21, 2720, 0, -9,
  -1, -1, 0, 2, 0, 7350, 0, -8, -51, 0, 4,
  2, 0, 0, -2, 1, 4065, 0, 6, -2206, 0, 1,
  1, 0, 0, 2, 0, 6579, 0, -24, -199, 0, 2,

  0, 1, 2, -2, 1, 3579, 0, 5, -1900, 0, 1,
  1, -1, 0, 0, 0, 4725, 0, -6, -41, 0, 3,
  -2, 0, 2, 0, 2, -3075, 0, -2, 1313, 0, -1,
  3, 0, 2, 0, 2, -2904, 0, 15, 1233, 0, 7,
  0, -1, 0, 2, 0, 4348, 0, -10, -81, 0, 2,
  1, -1, 2, 0, 2, -2878, 0, 8, 1232, 0, 4,
  0, 0, 0, 1, 0, -4230, 0, 5, -20, 0, -2,
  -1, -1, 2, 2, 2, -2819, 0, 7, 1207, 0, 3,
  -1, 0, 2, 0, 0, -4056, 0, 5, 40, 0, -2,
  0, -1, 2, 2, 2, -2647, 0, 11, 1129, 0, 5,

  -2, 0, 0, 0, 1, -2294, 0, -10, 1266, 0, -4,
  1, 1, 2, 0, 2, 2481, 0, -7, -1062, 0, -3,
  2, 0, 0, 0, 1, 2179, 0, -2, -1129, 0, -2,
  -1, 1, 0, 1, 0, 3276, 0, 1, -9, 0, 0,
  1, 1, 0, 0, 0, -3389, 0, 5, 35, 0, -2,
  1, 0, 2, 0, 0, 3339, 0, -13, -107, 0, 1,
  -1, 0, 2, -2, 1, -1987, 0, -6, 1073, 0, -2,
  1, 0, 0, 0, 2, -1981, 0, 0, 854, 0, 0,
  -1, 0, 0, 1, 0, 4026, 0, -353, -553, 0, -139,
  0, 0, 2, 1, 2, 1660, 0, -5, -710, 0, -2,

  -1, 0, 2, 4, 2, -1521, 0, 9, 647, 0, 4,
  -1, 1, 0, 1, 1, 1314, 0, 0, -700, 0, 0,
  0, -2, 2, -2, 1, -1283, 0, 0, 672, 0, 0,
  1, 0, 2, 2, 1, -1331, 0, 8, 663, 0, 4,
  -2, 0, 2, 2, 2, 1383, 0, -2, -594, 0, -2,
  -1, 0, 0, 0, 2, 1405, 0, 4, -610, 0, 2,
  1, 1, 2, -2, 2, 1290, 0, 0, -556, 0, 0
);

function nutation(t, zq) { //章动计算,t是J2000.0起算的儒略世纪数,zq表示只计算周期大于zq(天)的项
  var t2 = t * t, t3 = t2 * t, t4 = t3 * t; //t的二、三、四次方
  var l = 485868.249036 + 1717915923.2178 * t + 31.8792 * t2 + 0.051635 * t3 - 0.00024470 * t4;
  var l1 = 1287104.79305 + 129596581.0481 * t - 0.5532 * t2 + 0.000136 * t3 - 0.00001149 * t4;
  var F = 335779.526232 + 1739527262.8478 * t - 12.7512 * t2 - 0.001037 * t3 + 0.00000417 * t4;
  var D = 1072260.70369 + 1602961601.2090 * t - 6.3706 * t2 + 0.006593 * t3 - 0.00003169 * t4;
  var Om = 450160.398036 - 6962890.5431 * t + 7.4722 * t2 + 0.007702 * t3 - 0.00005939 * t4;
  var i, dL = 0, dE = 0, c;
  var B = nuTab, q;
  for (i = 0; i < 77 * 11; i += 11) { //周期项取和计算
    c = (B[i] * l + B[i + 1] * l1 + B[i + 2] * F + B[i + 3] * D + B[i + 4] * Om) / rad;
    if (zq) { //只算周期大于zq天的项
      q = 36526 * 2 * Math.PI * rad / (1717915923.2178 * B[i] + 129596581.0481 * B[i + 1] + 1739527262.8478 * B[i + 2] + 1602961601.2090 * B[i + 3] + 6962890.5431 * B[i + 4]);
      if (q < zq) continue;
    }
    dL += (B[i + 5] + B[i + 6] * t) * Math.sin(c) + B[i + 7] * Math.cos(c);
    dE += (B[i + 8] + B[i + 9] * t) * Math.cos(c) + B[i + 10] * Math.sin(c);
  }
  return new Array(dL /= 10000000 * rad, dE /= 10000000 * rad); //返回IAU2000B章动值, dL是黄经章动,dE是交角章动
}

function CDnutation(z, E, dL, dE) { //本函数计算赤经章动及赤纬章动
  var r = new Array(z[0], z[1], z[2]);
  r[0] += (cos(E) + sin(E) * sin(z[0]) * tan(z[1])) * dL - cos(z[0]) * tan(z[1]) * dE; //赤经章动
  r[1] += sin(E) * cos(z[0]) * dL + sin(z[0]) * dE; //赤纬章动
  r[0] = rad2mrad(r[0]);
  return r;
}


var nutB = new Array(//中精度章动计算表
  2.1824, -33.75705, 36e-6, -1720, 920,
  3.5069, 1256.66393, 11e-6, -132, 57,
  1.3375, 16799.4182, -51e-6, -23, 10,
  4.3649, -67.5141, 72e-6, 21, -9,
  0.04, -628.302, 0, -14, 0,
  2.36, 8328.691, 0, 7, 0,
  3.46, 1884.966, 0, -5, 2,
  5.44, 16833.175, 0, -4, 2,
  3.69, 25128.110, 0, -3, 0,
  3.55, 628.362, 0, 2, 0);

function nutation2(t) { //中精度章动计算,t是世纪数
  var i, c, a, t2 = t * t, B = this.nutB, dL = 0, dE = 0;
  for (i = 0; i < B.length; i += 5) {
    c = B[i] + B[i + 1] * t + B[i + 2] * t2;
    if (i == 0) a = -1.742 * t; else a = 0;
    dL += (B[i + 3] + a) * Math.sin(c);
    dE += B[i + 4] * Math.cos(c);
  }
  return [dL / 100 / rad, dE / 100 / rad]; //黄经章动,交角章动
}
function nutationLon2(t) { //只计算黄经章动
  var i, a, t2 = t * t, dL = 0, B = this.nutB;
  for (i = 0; i < B.length; i += 5) {
    if (i == 0) a = -1.742 * t; else a = 0;
    dL += (B[i + 3] + a) * Math.sin(B[i] + B[i + 1] * t + B[i + 2] * t2);
  }
  return dL / 100 / rad;
}


//=================================蒙气改正=========================================
//==================================================================================
function MQC(h) { return 0.0002967 / Math.tan(h + 0.003138 / (h + 0.08919)); } //大气折射,h是真高度
function MQC2(ho) { return -0.0002909 / Math.tan(ho + 0.002227 / (ho + 0.07679)); } //大气折射,ho是视高度

//=================================视差改正=========================================
//==================================================================================
function parallax(z, H, fa, high) { //视差修正
  //z赤道坐标,fa地理纬度,H时角,high海拔(千米)
  var dw = 1; if (z[2] < 500) dw = cs_AU;
  z[2] *= dw;
  var r0, x0, y0, z0, f = cs_ba, u = Math.atan(f * Math.tan(fa)), g = z[0] + H;
  r0 = cs_rEar * Math.cos(u) + high * Math.cos(fa); //站点与地地心向径的赤道投影长度
  z0 = cs_rEar * Math.sin(u) * f + high * Math.sin(fa); //站点与地地心向径的轴向投影长度
  x0 = r0 * Math.cos(g);
  y0 = r0 * Math.sin(g);

  var s = llr2xyz(z);
  s[0] -= x0, s[1] -= y0, s[2] -= z0;
  s = xyz2llr(s);
  z[0] = s[0], z[1] = s[1], z[2] = s[2] / dw;
}

//=================================星历数据=========================================
//==================================================================================

/********************************
8行星星历数据表,及数据表的计算
********************************/

var XL0 = new Array(

  //Dear精度:J2000+-4千年 黄经0.1角秒 黄纬0.1角秒 距离0.1AU/10^6
  new Array(
    10000000000,//A的倍率
    20, 578, 920, 1100, 1124, 1136, 1148, 1217, 1226, 1229, 1229, 1229, 1229, 1937, 2363, 2618, 2633, 2660, 2666,//位置索引表
/*L0*/  17534704567, 0.00000000000, 0.00000000000, 334165646, 4.669256804, 6283.075849991, 3489428, 4.6261024, 12566.1517000, 349706, 2.744118, 5753.384885, 341757, 2.828866, 3.523118, 313590, 3.627670, 77713.771468, 267622, 4.418084, 7860.419392, 234269, 6.135162, 3930.209696, 132429, 0.742464, 11506.769770, 127317, 2.037097, 529.690965, 119917, 1.109629, 1577.343542, 99025, 5.23268, 5884.92685, 90186, 2.04505, 26.29832, 85722, 3.50849, 398.14900, 77979, 1.17883, 5223.69392, 75314, 2.53339, 5507.55324, 50526, 4.58293, 18849.22755, 49238, 4.20507, 775.52261, 35666, 2.91954, 0.06731, 31709, 5.84902, 11790.62909, 28413, 1.89869, 796.29801, 27104, 0.31489, 10977.07880, 24281, 0.34481, 5486.77784, 20616, 4.80647, 2544.31442, 20539, 1.86948, 5573.14280, 20226, 2.45768, 6069.77675, 15552, 0.83306, 213.29910, 13221, 3.41118, 2942.46342, 12618, 1.08303, 20.77540, 11513, 0.64545, 0.98032, 10285, 0.63600, 4694.00295, 10190, 0.97569, 15720.83878, 10172, 4.26680, 7.11355, 9921, 6.2099, 2146.1654, 9761, 0.6810, 155.4204, 8580, 5.9832, 161000.6857, 8513, 1.2987, 6275.9623, 8471, 3.6708, 71430.6956, 7964, 1.8079, 17260.1547, 7876, 3.0370, 12036.4607, 7465, 1.7551, 5088.6288, 7387, 3.5032, 3154.6871, 7355, 4.6793, 801.8209, 6963, 0.8330, 9437.7629, 6245, 3.9776, 8827.3903, 6115, 1.8184, 7084.8968, 5696, 2.7843, 6286.5990, 5612, 4.3869, 14143.4952, 5558, 3.4701, 6279.5527, 5199, 0.1891, 12139.5535, 5161, 1.3328, 1748.0164, 5115, 0.2831, 5856.4777, 4900, 0.4874, 1194.4470, 4104, 5.3682, 8429.2413, 4094, 2.3985, 19651.0485, 3920, 6.1683, 10447.3878, 3677, 6.0413, 10213.2855, 3660, 2.5696, 1059.3819, 3595, 1.7088, 2352.8662, 3557, 1.7760, 6812.7668, 3329, 0.5931, 17789.8456, 3041, 0.4429, 83996.8473, 3005, 2.7398, 1349.8674, 2535, 3.1647, 4690.4798, 2474, 0.2148, 3.5904, 2366, 0.4847, 8031.0923, 2357, 2.0653, 3340.6124, 2282, 5.2220, 4705.7323, 2189, 5.5559, 553.5694, 2142, 1.4256, 16730.4637, 2109, 4.1483, 951.7184, 2030, 0.3713, 283.8593, 1992, 5.2221, 12168.0027, 1986, 5.7747, 6309.3742, 1912, 3.8222, 23581.2582, 1889, 5.3863, 149854.4001, 1790, 2.2149, 13367.9726, 1748, 4.5605, 135.0651, 1622, 5.9884, 11769.8537, 1508, 4.1957, 6256.7775, 1442, 4.1932, 242.7286, 1435, 3.7236, 38.0277, 1397, 4.4014, 6681.2249, 1362, 1.8893, 7632.9433, 1250, 1.1305, 5.5229, 1205, 2.6223, 955.5997, 1200, 1.0035, 632.7837, 1129, 0.1774, 4164.3120, 1083, 0.3273, 103.0928, 1052, 0.9387, 11926.2544, 1050, 5.3591, 1592.5960, 1033, 6.1998, 6438.4962, 1001, 6.0291, 5746.2713, 980, 0.999, 11371.705, 980, 5.244, 27511.468, 938, 2.624, 5760.498, 923, 0.483, 522.577, 922, 4.571, 4292.331, 905, 5.337, 6386.169, 862, 4.165, 7058.598, 841, 3.299, 7234.794, 836, 4.539, 25132.303, 813, 6.112, 4732.031, 812, 6.271, 426.598, 801, 5.821, 28.449, 787, 0.996, 5643.179, 776, 2.957, 23013.540, 769, 3.121, 7238.676, 758, 3.974, 11499.656, 735, 4.386, 316.392, 731, 0.607, 11513.883, 719, 3.998, 74.782, 706, 0.323, 263.084, 676, 5.911, 90955.552, 663, 3.665, 17298.182, 653, 5.791, 18073.705, 630, 4.717, 6836.645, 615, 1.458, 233141.314, 612, 1.075, 19804.827, 596, 3.321, 6283.009, 596, 2.876, 6283.143, 555, 2.452, 12352.853, 541, 5.392, 419.485, 531, 0.382, 31441.678, 519, 4.065, 6208.294, 513, 2.361, 10973.556, 494, 5.737, 9917.697, 450, 3.272, 11015.106, 449, 3.653, 206.186, 447, 2.064, 7079.374, 435, 4.423, 5216.580, 421, 1.906, 245.832, 413, 0.921, 3738.761, 402, 0.840, 20.355, 387, 1.826, 11856.219, 379, 2.344, 3.881, 374, 2.954, 3128.389, 370, 5.031, 536.805, 365, 1.018, 16200.773, 365, 1.083, 88860.057, 352, 5.978, 3894.182, 352, 2.056, 244287.600, 351, 3.713, 6290.189, 340, 1.106, 14712.317, 339, 0.978, 8635.942, 339, 3.202, 5120.601, 333, 0.837, 6496.375, 325, 3.479, 6133.513, 316, 5.089, 21228.392, 316, 1.328, 10873.986, 309, 3.646, 10.637, 303, 1.802, 35371.887, 296, 3.397, 9225.539, 288, 6.026, 154717.610, 281, 2.585, 14314.168, 262, 3.856, 266.607, 262, 2.579, 22483.849, 257, 1.561, 23543.231, 255, 3.949, 1990.745, 251, 3.744, 10575.407, 240, 1.161, 10984.192, 238, 0.106, 7.046, 236, 4.272, 6040.347, 234, 3.577, 10969.965, 211, 3.714, 65147.620, 210, 0.754, 13521.751, 207, 4.228, 5650.292, 202, 0.814, 170.673, 201, 4.629, 6037.244, 200, 0.381, 6172.870, 199, 3.933, 6206.810, 199, 5.197, 6262.300, 197, 1.046, 18209.330, 195, 1.070, 5230.807, 195, 4.869, 36.028, 194, 4.313, 6244.943, 192, 1.229, 709.933, 192, 5.595, 6282.096, 192, 0.602, 6284.056, 189, 3.744, 23.878, 188, 1.904, 15.252, 188, 0.867, 22003.915, 182, 3.681, 15110.466, 181, 0.491, 1.484, 179, 3.222, 39302.097, 179, 1.259, 12559.038,
/*L1*/  62833196674749, 0.000000000000, 0.000000000000, 20605886, 2.67823456, 6283.07584999, 430343, 2.635127, 12566.151700, 42526, 1.59047, 3.52312, 11926, 5.79557, 26.29832, 10898, 2.96618, 1577.34354, 9348, 2.5921, 18849.2275, 7212, 1.1385, 529.6910, 6777, 1.8747, 398.1490, 6733, 4.4092, 5507.5532, 5903, 2.8880, 5223.6939, 5598, 2.1747, 155.4204, 4541, 0.3980, 796.2980, 3637, 0.4662, 775.5226, 2896, 2.6471, 7.1135, 2084, 5.3414, 0.9803, 1910, 1.8463, 5486.7778, 1851, 4.9686, 213.2991, 1729, 2.9912, 6275.9623, 1623, 0.0322, 2544.3144, 1583, 1.4305, 2146.1654, 1462, 1.2053, 10977.0788, 1246, 2.8343, 1748.0164, 1188, 3.2580, 5088.6288, 1181, 5.2738, 1194.4470, 1151, 2.0750, 4694.0030, 1064, 0.7661, 553.5694, 997, 1.303, 6286.599, 972, 4.239, 1349.867, 945, 2.700, 242.729, 858, 5.645, 951.718, 758, 5.301, 2352.866, 639, 2.650, 9437.763, 610, 4.666, 4690.480, 583, 1.766, 1059.382, 531, 0.909, 3154.687, 522, 5.661, 71430.696, 520, 1.854, 801.821, 504, 1.425, 6438.496, 433, 0.241, 6812.767, 426, 0.774, 10447.388, 413, 5.240, 7084.897, 374, 2.001, 8031.092, 356, 2.429, 14143.495, 350, 4.800, 6279.553, 337, 0.888, 12036.461, 337, 3.862, 1592.596, 325, 3.400, 7632.943, 322, 0.616, 8429.241, 318, 3.188, 4705.732, 297, 6.070, 4292.331, 295, 1.431, 5746.271, 290, 2.325, 20.355, 275, 0.935, 5760.498, 270, 4.804, 7234.794, 253, 6.223, 6836.645, 228, 5.003, 17789.846, 225, 5.672, 11499.656, 215, 5.202, 11513.883, 208, 3.955, 10213.286, 208, 2.268, 522.577, 206, 2.224, 5856.478, 206, 2.550, 25132.303, 203, 0.910, 6256.778, 189, 0.532, 3340.612, 188, 4.735, 83996.847, 179, 1.474, 4164.312, 178, 3.025, 5.523, 177, 3.026, 5753.385, 159, 4.637, 3.286, 157, 6.124, 5216.580, 155, 3.077, 6681.225, 154, 4.200, 13367.973, 143, 1.191, 3894.182, 138, 3.093, 135.065, 136, 4.245, 426.598, 134, 5.765, 6040.347, 128, 3.085, 5643.179, 127, 2.092, 6290.189, 125, 3.077, 11926.254, 125, 3.445, 536.805, 114, 3.244, 12168.003, 112, 2.318, 16730.464, 111, 3.901, 11506.770, 111, 5.320, 23.878, 105, 3.750, 7860.419, 103, 2.447, 1990.745, 96, 0.82, 3.88, 96, 4.08, 6127.66, 91, 5.42, 206.19, 91, 0.42, 7079.37, 88, 5.17, 11790.63, 81, 0.34, 9917.70, 80, 3.89, 10973.56, 78, 2.40, 1589.07, 78, 2.58, 11371.70, 77, 3.98, 955.60, 77, 3.36, 36.03, 76, 1.30, 103.09, 75, 5.18, 10969.97, 75, 4.96, 6496.37, 73, 5.21, 38.03, 72, 2.65, 6309.37, 70, 5.61, 3738.76, 69, 2.60, 3496.03, 69, 0.39, 15.25, 69, 2.78, 20.78, 65, 1.13, 7058.60, 64, 4.28, 28.45, 61, 5.63, 10984.19, 60, 0.73, 419.48, 60, 5.28, 10575.41, 58, 5.55, 17298.18, 58, 3.19, 4732.03,
/*L2*/  5291887, 0.0000000, 0.0000000, 871984, 1.072097, 6283.075850, 30913, 0.86729, 12566.15170, 2734, 0.0530, 3.5231, 1633, 5.1883, 26.2983, 1575, 3.6846, 155.4204, 954, 0.757, 18849.228, 894, 2.057, 77713.771, 695, 0.827, 775.523, 506, 4.663, 1577.344, 406, 1.031, 7.114, 381, 3.441, 5573.143, 346, 5.141, 796.298, 317, 6.053, 5507.553, 302, 1.192, 242.729, 289, 6.117, 529.691, 271, 0.306, 398.149, 254, 2.280, 553.569, 237, 4.381, 5223.694, 208, 3.754, 0.980, 168, 0.902, 951.718, 153, 5.759, 1349.867, 145, 4.364, 1748.016, 134, 3.721, 1194.447, 125, 2.948, 6438.496, 122, 2.973, 2146.165, 110, 1.271, 161000.686, 104, 0.604, 3154.687, 100, 5.986, 6286.599, 92, 4.80, 5088.63, 89, 5.23, 7084.90, 83, 3.31, 213.30, 76, 3.42, 5486.78, 71, 6.19, 4690.48, 68, 3.43, 4694.00, 65, 1.60, 2544.31, 64, 1.98, 801.82, 61, 2.48, 10977.08, 50, 1.44, 6836.65, 49, 2.34, 1592.60, 46, 1.31, 4292.33, 46, 3.81, 149854.40, 43, 0.04, 7234.79, 40, 4.94, 7632.94, 39, 1.57, 71430.70, 38, 3.17, 6309.37, 35, 0.99, 6040.35, 35, 0.67, 1059.38, 31, 3.18, 2352.87, 31, 3.55, 8031.09, 30, 1.92, 10447.39, 30, 2.52, 6127.66, 28, 4.42, 9437.76, 28, 2.71, 3894.18, 27, 0.67, 25132.30, 26, 5.27, 6812.77, 25, 0.55, 6279.55, 23, 1.38, 4705.73, 22, 0.64, 6256.78, 20, 6.07, 640.88,
/*L3*/  28923, 5.84384, 6283.07585, 3496, 0.0000, 0.0000, 1682, 5.4877, 12566.1517, 296, 5.196, 155.420, 129, 4.722, 3.523, 71, 5.30, 18849.23, 64, 5.97, 242.73, 40, 3.79, 553.57,
/*L4*/  11408, 3.14159, 0.00000, 772, 4.134, 6283.076, 77, 3.84, 12566.15, 42, 0.42, 155.42,
/*L5*/  88, 3.14, 0.00, 17, 2.77, 6283.08, 5, 2.01, 155.42, 3, 2.21, 12566.15,
/*B0*/  27962, 3.19870, 84334.66158, 10164, 5.42249, 5507.55324, 8045, 3.8801, 5223.6939, 4381, 3.7044, 2352.8662, 3193, 4.0003, 1577.3435, 2272, 3.9847, 1047.7473, 1814, 4.9837, 6283.0758, 1639, 3.5646, 5856.4777, 1444, 3.7028, 9437.7629, 1430, 3.4112, 10213.2855, 1125, 4.8282, 14143.4952, 1090, 2.0857, 6812.7668, 1037, 4.0566, 71092.8814, 971, 3.473, 4694.003, 915, 1.142, 6620.890, 878, 4.440, 5753.385, 837, 4.993, 7084.897, 770, 5.554, 167621.576, 719, 3.602, 529.691, 692, 4.326, 6275.962, 558, 4.410, 7860.419, 529, 2.484, 4705.732, 521, 6.250, 18073.705,
/*B1*/  903, 3.897, 5507.553, 618, 1.730, 5223.694, 380, 5.244, 2352.866,
/*B2*/  166, 1.627, 84334.662,
/*R0*/  10001398880, 0.00000000000, 0.00000000000, 167069963, 3.098463508, 6283.075849991, 1395602, 3.0552461, 12566.1517000, 308372, 5.198467, 77713.771468, 162846, 1.173877, 5753.384885, 157557, 2.846852, 7860.419392, 92480, 5.45292, 11506.76977, 54244, 4.56409, 3930.20970, 47211, 3.66100, 5884.92685, 34598, 0.96369, 5507.55324, 32878, 5.89984, 5223.69392, 30678, 0.29867, 5573.14280, 24319, 4.27350, 11790.62909, 21183, 5.84715, 1577.34354, 18575, 5.02194, 10977.07880, 17484, 3.01194, 18849.22755, 10984, 5.05511, 5486.77784, 9832, 0.8868, 6069.7768, 8650, 5.6896, 15720.8388, 8583, 1.2708, 161000.6857, 6490, 0.2725, 17260.1547, 6292, 0.9218, 529.6910, 5706, 2.0137, 83996.8473, 5574, 5.2416, 71430.6956, 4938, 3.2450, 2544.3144, 4696, 2.5781, 775.5226, 4466, 5.5372, 9437.7629, 4252, 6.0111, 6275.9623, 3897, 5.3607, 4694.0030, 3825, 2.3926, 8827.3903, 3749, 0.8295, 19651.0485, 3696, 4.9011, 12139.5535, 3566, 1.6747, 12036.4607, 3454, 1.8427, 2942.4634, 3319, 0.2437, 7084.8968, 3192, 0.1837, 5088.6288, 3185, 1.7778, 398.1490, 2846, 1.2134, 6286.5990, 2779, 1.8993, 6279.5527, 2628, 4.5890, 10447.3878, 2460, 3.7866, 8429.2413, 2393, 4.9960, 5856.4777, 2359, 0.2687, 796.2980, 2329, 2.8078, 14143.4952, 2210, 1.9500, 3154.6871, 2035, 4.6527, 2146.1654, 1951, 5.3823, 2352.8662, 1883, 0.6731, 149854.4001, 1833, 2.2535, 23581.2582, 1796, 0.1987, 6812.7668, 1731, 6.1520, 16730.4637, 1717, 4.4332, 10213.2855, 1619, 5.2316, 17789.8456, 1381, 5.1896, 8031.0923, 1364, 3.6852, 4705.7323, 1314, 0.6529, 13367.9726, 1041, 4.3329, 11769.8537, 1017, 1.5939, 4690.4798, 998, 4.201, 6309.374, 966, 3.676, 27511.468, 874, 6.064, 1748.016, 779, 3.674, 12168.003, 771, 0.312, 7632.943, 756, 2.626, 6256.778, 746, 5.648, 11926.254, 693, 2.924, 6681.225, 680, 1.423, 23013.540, 674, 0.563, 3340.612, 663, 5.661, 11371.705, 659, 3.136, 801.821, 648, 2.650, 19804.827, 615, 3.029, 233141.314, 612, 5.134, 1194.447, 563, 4.341, 90955.552, 552, 2.091, 17298.182, 534, 5.100, 31441.678, 531, 2.407, 11499.656, 523, 4.624, 6438.496, 513, 5.324, 11513.883, 477, 0.256, 11856.219, 461, 1.722, 7234.794, 458, 3.766, 6386.169, 458, 4.466, 5746.271, 423, 1.055, 5760.498, 422, 1.557, 7238.676, 415, 2.599, 7058.598, 401, 3.030, 1059.382, 397, 1.201, 1349.867, 379, 4.907, 4164.312, 360, 5.707, 5643.179, 352, 3.626, 244287.600, 348, 0.761, 10973.556, 342, 3.001, 4292.331, 336, 4.546, 4732.031, 334, 3.138, 6836.645, 324, 4.164, 9917.697, 316, 1.691, 11015.106, 307, 0.238, 35371.887, 298, 1.306, 6283.143, 298, 1.750, 6283.009, 293, 5.738, 16200.773, 286, 5.928, 14712.317, 281, 3.515, 21228.392, 280, 5.663, 8635.942, 277, 0.513, 26.298, 268, 4.207, 18073.705, 266, 0.900, 12352.853, 260, 2.962, 25132.303, 255, 2.477, 6208.294, 242, 2.800, 709.933, 231, 1.054, 22483.849, 229, 1.070, 14314.168, 216, 1.314, 154717.610, 215, 6.038, 10873.986, 200, 0.561, 7079.374, 198, 2.614, 951.718, 197, 4.369, 167283.762, 186, 2.861, 5216.580, 183, 1.660, 39302.097, 183, 5.912, 3738.761, 175, 2.145, 6290.189, 173, 2.168, 10575.407, 171, 3.702, 1592.596, 171, 1.343, 3128.389, 164, 5.550, 6496.375, 164, 5.856, 10984.192, 161, 1.998, 10969.965, 161, 1.909, 6133.513, 157, 4.955, 25158.602, 154, 6.216, 23543.231, 153, 5.357, 13521.751, 150, 5.770, 18209.330, 150, 5.439, 155.420, 139, 1.778, 9225.539, 139, 1.626, 5120.601, 128, 2.460, 13916.019, 123, 0.717, 143571.324, 122, 2.654, 88860.057, 121, 4.414, 3894.182, 121, 1.192, 3.523, 120, 4.030, 553.569, 119, 1.513, 17654.781, 117, 3.117, 14945.316, 113, 2.698, 6040.347, 110, 3.085, 43232.307, 109, 0.998, 955.600, 108, 2.939, 17256.632, 107, 5.285, 65147.620, 103, 0.139, 11712.955, 103, 5.850, 213.299, 102, 3.046, 6037.244, 101, 2.842, 8662.240, 100, 3.626, 6262.300, 98, 2.36, 6206.81, 98, 5.11, 6172.87, 98, 2.00, 15110.47, 97, 2.67, 5650.29, 97, 2.75, 6244.94, 96, 4.02, 6282.10, 96, 5.31, 6284.06, 92, 0.10, 29088.81, 85, 3.26, 20426.57, 84, 2.60, 28766.92, 81, 3.58, 10177.26, 80, 5.81, 5230.81, 78, 2.53, 16496.36, 77, 4.06, 6127.66, 73, 0.04, 5481.25, 72, 5.96, 12559.04, 72, 5.92, 4136.91, 71, 5.49, 22003.91, 70, 3.41, 7.11, 69, 0.62, 11403.68, 69, 3.90, 1589.07, 69, 1.96, 12416.59, 69, 4.51, 426.60, 67, 1.61, 11087.29, 66, 4.50, 47162.52, 66, 5.08, 283.86, 66, 4.32, 16858.48, 65, 1.04, 6062.66, 64, 1.59, 18319.54, 63, 5.70, 45892.73, 63, 4.60, 66567.49, 63, 3.82, 13517.87, 62, 2.62, 11190.38, 61, 1.54, 33019.02, 60, 5.58, 10344.30, 60, 5.38, 316428.23, 60, 5.78, 632.78, 59, 6.12, 9623.69, 57, 0.16, 17267.27, 57, 3.86, 6076.89, 57, 1.98, 7668.64, 56, 4.78, 20199.09, 55, 4.56, 18875.53, 55, 3.51, 17253.04, 54, 3.07, 226858.24, 54, 4.83, 18422.63, 53, 5.02, 12132.44, 52, 3.63, 5333.90, 52, 0.97, 155427.54, 51, 3.36, 20597.24, 50, 0.99, 11609.86, 50, 2.21, 1990.75, 48, 1.62, 12146.67, 48, 1.17, 12569.67, 47, 4.62, 5436.99, 47, 1.81, 12562.63, 47, 0.59, 21954.16, 47, 0.76, 7342.46, 46, 0.27, 4590.91, 46, 3.77, 156137.48, 45, 5.66, 10454.50, 44, 5.84, 3496.03, 43, 0.24, 17996.03, 41, 5.93, 51092.73, 41, 4.21, 12592.45, 40, 5.14, 1551.05, 40, 5.28, 15671.08, 39, 3.69, 18052.93, 39, 4.94, 24356.78, 38, 2.72, 11933.37, 38, 5.23, 7477.52, 38, 4.99, 9779.11, 37, 3.70, 9388.01, 37, 4.44, 4535.06, 36, 2.16, 28237.23, 36, 2.54, 242.73, 36, 0.22, 5429.88, 35, 6.15, 19800.95, 35, 2.92, 36949.23, 34, 5.63, 2379.16, 34, 5.73, 16460.33, 34, 5.11, 5849.36, 33, 6.19, 6268.85,
/*R1*/  10301861, 1.10748970, 6283.07584999, 172124, 1.064423, 12566.151700, 70222, 3.14159, 0.00000, 3235, 1.0217, 18849.2275, 3080, 2.8435, 5507.5532, 2497, 1.3191, 5223.6939, 1849, 1.4243, 1577.3435, 1008, 5.9138, 10977.0788, 865, 1.420, 6275.962, 863, 0.271, 5486.778, 507, 1.686, 5088.629, 499, 6.014, 6286.599, 467, 5.987, 529.691, 440, 0.518, 4694.003, 410, 1.084, 9437.763, 387, 4.750, 2544.314, 375, 5.071, 796.298, 352, 0.023, 83996.847, 344, 0.949, 71430.696, 341, 5.412, 775.523, 322, 6.156, 2146.165, 286, 5.484, 10447.388, 284, 3.420, 2352.866, 255, 6.132, 6438.496, 252, 0.243, 398.149, 243, 3.092, 4690.480, 225, 3.689, 7084.897, 220, 4.952, 6812.767, 219, 0.420, 8031.092, 209, 1.282, 1748.016, 193, 5.314, 8429.241, 185, 1.820, 7632.943, 175, 3.229, 6279.553, 173, 1.537, 4705.732, 158, 4.097, 11499.656, 158, 5.539, 3154.687, 150, 3.633, 11513.883, 148, 3.222, 7234.794, 147, 3.653, 1194.447, 144, 0.817, 14143.495, 135, 6.151, 5746.271, 134, 4.644, 6836.645, 128, 2.693, 1349.867, 123, 5.650, 5760.498, 118, 2.577, 13367.973, 113, 3.357, 17789.846, 110, 4.497, 4292.331, 108, 5.828, 12036.461, 102, 5.621, 6256.778, 99, 1.14, 1059.38, 98, 0.66, 5856.48, 93, 2.32, 10213.29, 92, 0.77, 16730.46, 88, 1.50, 11926.25, 86, 1.42, 5753.38, 85, 0.66, 155.42, 81, 1.64, 6681.22, 80, 4.11, 951.72, 66, 4.55, 5216.58, 65, 0.98, 25132.30, 64, 4.19, 6040.35, 64, 0.52, 6290.19, 63, 1.51, 5643.18, 59, 6.18, 4164.31, 57, 2.30, 10973.56, 55, 2.32, 11506.77, 55, 2.20, 1592.60, 55, 5.27, 3340.61, 54, 5.54, 553.57, 53, 5.04, 9917.70, 53, 0.92, 11371.70, 52, 3.98, 17298.18, 52, 3.60, 10969.97, 49, 5.91, 3894.18, 49, 2.51, 6127.66, 48, 1.67, 12168.00, 46, 0.31, 801.82, 42, 3.70, 10575.41, 42, 4.05, 10984.19, 40, 2.17, 7860.42, 40, 4.17, 26.30, 38, 5.82, 7058.60, 37, 3.39, 6496.37, 36, 1.08, 6309.37, 36, 5.34, 7079.37, 34, 3.62, 11790.63, 32, 0.32, 16200.77, 31, 4.24, 3738.76, 29, 4.55, 11856.22, 29, 1.26, 8635.94, 27, 3.45, 5884.93, 26, 5.08, 10177.26, 26, 5.38, 21228.39, 24, 2.26, 11712.96, 24, 1.05, 242.73, 24, 5.59, 6069.78, 23, 3.63, 6284.06, 23, 1.64, 4732.03, 22, 3.46, 213.30, 21, 1.05, 3496.03, 21, 3.92, 13916.02, 21, 4.01, 5230.81, 20, 5.16, 12352.85, 20, 0.69, 1990.75, 19, 2.73, 6062.66, 19, 5.01, 11015.11, 18, 6.04, 6283.01, 18, 2.85, 7238.68, 18, 5.60, 6283.14, 18, 5.16, 17253.04, 18, 2.54, 14314.17, 17, 1.58, 7.11, 17, 0.98, 3930.21, 17, 4.75, 17267.27, 16, 2.19, 6076.89, 16, 2.19, 18073.70, 16, 6.12, 3.52, 16, 4.61, 9623.69, 16, 3.40, 16496.36, 15, 0.19, 9779.11, 15, 5.30, 13517.87, 15, 4.26, 3128.39, 15, 0.81, 709.93, 14, 0.50, 25158.60, 14, 4.38, 4136.91, 13, 0.98, 65147.62, 13, 3.31, 154717.61, 13, 2.11, 1589.07, 13, 1.92, 22483.85, 12, 6.03, 9225.54, 12, 1.53, 12559.04, 12, 5.82, 6282.10, 12, 5.61, 5642.20, 12, 2.38, 167283.76, 12, 0.39, 12132.44, 12, 3.98, 4686.89, 12, 5.81, 12569.67, 12, 0.56, 5849.36, 11, 0.45, 6172.87, 11, 5.80, 16858.48, 11, 6.22, 12146.67, 11, 2.27, 5429.88,
/*R2*/  435939, 5.784551, 6283.075850, 12363, 5.57935, 12566.15170, 1234, 3.1416, 0.0000, 879, 3.628, 77713.771, 569, 1.870, 5573.143, 330, 5.470, 18849.228, 147, 4.480, 5507.553, 110, 2.842, 161000.686, 101, 2.815, 5223.694, 85, 3.11, 1577.34, 65, 5.47, 775.52, 61, 1.38, 6438.50, 50, 4.42, 6286.60, 47, 3.66, 7084.90, 46, 5.39, 149854.40, 42, 0.90, 10977.08, 40, 3.20, 5088.63, 35, 1.81, 5486.78, 32, 5.35, 3154.69, 30, 3.52, 796.30, 29, 4.62, 4690.48, 28, 1.84, 4694.00, 27, 3.14, 71430.70, 27, 6.17, 6836.65, 26, 1.42, 2146.17, 25, 2.81, 1748.02, 24, 2.18, 155.42, 23, 4.76, 7234.79, 21, 3.38, 7632.94, 21, 0.22, 4705.73, 20, 4.22, 1349.87, 20, 2.01, 1194.45, 20, 4.58, 529.69, 19, 1.59, 6309.37, 18, 5.70, 6040.35, 18, 6.03, 4292.33, 17, 2.90, 9437.76, 17, 2.00, 8031.09, 17, 5.78, 83996.85, 16, 0.05, 2544.31, 15, 0.95, 6127.66, 14, 0.36, 10447.39, 14, 1.48, 2352.87, 13, 0.77, 553.57, 13, 5.48, 951.72, 13, 5.27, 6279.55, 13, 3.76, 6812.77, 11, 5.41, 6256.78, 10, 0.68, 1592.60, 10, 4.95, 398.15, 10, 1.15, 3894.18, 10, 5.20, 244287.60, 10, 1.94, 11856.22, 9, 5.39, 25132.30, 8, 6.18, 1059.38, 8, 0.69, 8429.24, 8, 5.85, 242.73, 7, 5.26, 14143.50, 7, 0.52, 801.82, 6, 2.24, 8635.94, 6, 4.00, 13367.97, 6, 2.77, 90955.55, 6, 5.17, 7058.60, 5, 1.46, 233141.31, 5, 4.13, 7860.42, 5, 3.91, 26.30, 5, 3.89, 12036.46, 5, 5.58, 6290.19, 5, 5.54, 1990.75, 5, 0.83, 11506.77, 5, 6.22, 6681.22, 4, 5.26, 10575.41, 4, 1.91, 7477.52, 4, 0.43, 10213.29, 4, 1.09, 709.93, 4, 5.09, 11015.11, 4, 4.22, 88860.06, 4, 3.57, 7079.37, 4, 1.98, 6284.06, 4, 3.93, 10973.56, 4, 6.18, 9917.70, 4, 0.36, 10177.26, 4, 2.75, 3738.76, 4, 3.33, 5643.18, 4, 5.36, 25158.60,
/*R3*/  14459, 4.27319, 6283.07585, 673, 3.917, 12566.152, 77, 0.00, 0.00, 25, 3.73, 18849.23, 4, 2.80, 6286.60,
/*R4*/  386, 2.564, 6283.076, 31, 2.27, 12566.15, 5, 3.44, 5573.14, 2, 2.05, 18849.23, 1, 2.06, 77713.77, 1, 4.41, 161000.69, 1, 3.82, 149854.40, 1, 4.08, 6127.66, 1, 5.26, 6438.50,
/*R5*/  9, 1.22, 6283.08, 1, 0.66, 12566.15),

  //Dmer精度:J2000+-4千年 黄经0.2角秒 黄纬0.2角秒 距离0.2AU/10^6
  new Array(
    1000000000,//A的倍率
    20, 443, 710, 761, 791, 818, 824, 1043, 1106, 1142, 1169, 1190, 1196, 1550, 1742, 1781, 1808, 1823, 1823,//位置索引表
/*L0*/  4402507101, 0.0000000000, 0.0000000000, 409894150, 1.483020342, 26087.903141574, 50462942, 4.47785490, 52175.80628315, 8553468, 1.1652032, 78263.7094247, 1655904, 4.1196916, 104351.6125663, 345619, 0.779308, 130439.515708, 75835, 3.71348, 156527.41885, 35597, 1.51203, 1109.37855, 18035, 4.10333, 5661.33205, 17260, 0.35832, 182615.32199, 15899, 2.99510, 25028.52121, 13647, 4.59918, 27197.28169, 10173, 0.88031, 31749.23519, 7142, 1.5414, 24978.5246, 6438, 5.3027, 21535.9496, 4511, 6.0499, 51116.4244, 4042, 3.2823, 208703.2251, 3524, 5.2416, 20426.5711, 3452, 2.7921, 15874.6176, 3433, 5.7653, 955.5997, 3392, 5.8633, 25558.2122, 3253, 1.3367, 53285.1848, 2729, 2.4945, 529.6910, 2643, 3.9171, 57837.1383, 2596, 0.9873, 4551.9535, 2388, 0.1134, 1059.3819, 2348, 0.2667, 11322.6641, 2166, 0.6599, 13521.7514, 2090, 2.0918, 47623.8528, 1834, 2.6288, 27043.5029, 1816, 2.4341, 25661.3050, 1760, 4.5364, 51066.4277, 1726, 2.4520, 24498.8302, 1423, 3.3600, 37410.5672, 1379, 0.2910, 10213.2855, 1252, 3.7208, 39609.6546, 1182, 2.7815, 77204.3275, 1064, 4.2057, 19804.8273, 969, 6.204, 234791.128, 900, 5.852, 41962.521, 883, 5.413, 26617.594, 868, 2.642, 51646.115, 867, 1.960, 46514.474, 850, 4.331, 79373.088, 697, 3.572, 25132.303, 692, 4.194, 19.670, 685, 0.634, 83925.041, 648, 0.048, 33326.579, 635, 3.147, 7238.676, 595, 2.747, 16983.996, 565, 5.119, 73711.756, 554, 4.053, 30639.857, 544, 3.143, 27147.285, 515, 5.478, 50586.733, 496, 3.990, 6770.711, 480, 5.493, 51749.208, 476, 5.497, 3.881, 447, 1.224, 77154.331, 419, 5.193, 6283.076, 418, 5.642, 53131.406, 380, 2.431, 12566.152, 360, 1.424, 2218.757, 356, 0.814, 32858.614, 354, 3.370, 36301.189, 340, 0.475, 65697.558, 340, 2.786, 14765.239, 308, 5.770, 103292.231, 306, 5.840, 43071.899, 295, 0.698, 213.299, 285, 0.650, 426.598, 275, 0.980, 45892.730, 271, 0.085, 63498.470, 268, 1.061, 3442.575, 263, 0.648, 1589.073, 262, 5.242, 22645.328, 243, 4.400, 7.114, 237, 2.842, 260879.031, 229, 2.585, 68050.424, 224, 1.025, 105460.991, 223, 5.653, 77734.018, 223, 2.179, 52705.497, 222, 3.224, 25448.006, 220, 4.934, 72602.377, 186, 4.527, 28306.660, 178, 3.612, 110012.945, 176, 4.717, 25874.604, 172, 0.284, 51220.207, 172, 3.261, 153.779, 149, 1.835, 99799.659, 144, 0.966, 26107.573, 144, 1.910, 23969.139, 142, 5.142, 26068.233, 142, 6.124, 53235.188, 140, 2.302, 76674.637, 134, 4.518, 26080.790, 134, 0.766, 56727.760, 124, 2.223, 77837.111, 120, 6.205, 18849.228, 116, 2.385, 79219.309, 115, 4.178, 103242.234, 112, 2.048, 32370.979, 111, 3.783, 26301.202, 100, 2.046, 48733.231, 98, 2.27, 26091.78, 97, 3.84, 26084.02, 97, 2.99, 59414.48, 97, 5.78, 25938.34, 94, 5.44, 38654.05, 93, 4.03, 467.96, 90, 6.23, 25021.41, 90, 3.48, 91785.46, 90, 0.11, 62389.09, 89, 2.85, 25035.63, 83, 5.34, 19317.19, 82, 5.78, 40853.14, 81, 1.12, 26095.02, 80, 2.46, 129380.13, 76, 0.18, 12432.04, 74, 4.71, 6.63, 70, 3.99, 71980.63, 70, 1.63, 23869.15, 66, 3.66, 26514.50, 61, 3.67, 27676.98, 60, 0.00, 51535.91, 59, 3.99, 131548.89, 59, 4.12, 29530.48, 59, 5.57, 94138.33, 59, 5.76, 286966.93, 59, 6.13, 26011.64, 59, 2.14, 20760.43, 58, 2.35, 103821.92, 58, 4.45, 19406.68, 57, 3.02, 89586.37, 57, 5.18, 78793.40, 57, 1.61, 98690.28, 52, 3.29, 38519.95, 51, 3.78, 58946.52, 46, 0.29, 136100.85, 45, 1.50, 51962.51, 45, 4.89, 50057.04, 44, 3.25, 77308.11,
/*L1*/  26088147062227, 0.000000000000, 0.000000000000, 11260078, 6.21703971, 26087.90314157, 3034714, 3.0556547, 52175.8062831, 805385, 6.104547, 78263.709425, 212450, 2.835319, 104351.612566, 55921, 5.82676, 130439.51571, 14722, 2.51845, 156527.41885, 3883, 5.4804, 182615.3220, 3522, 3.0524, 1109.3786, 1027, 2.1488, 208703.2251, 935, 6.118, 27197.282, 906, 0.000, 24978.525, 519, 5.621, 5661.332, 444, 4.573, 25028.521, 281, 3.042, 51066.428, 273, 5.092, 234791.128, 220, 0.865, 955.600, 204, 3.715, 20426.571, 202, 0.519, 21535.950, 175, 5.727, 4551.953, 167, 1.351, 529.691, 154, 5.743, 19.670, 153, 1.792, 11322.664, 140, 3.594, 24498.830, 128, 2.696, 53285.185, 126, 3.895, 3.881, 126, 4.705, 1059.382, 86, 6.06, 77154.33, 80, 3.93, 27043.50, 80, 4.18, 26617.59, 79, 0.50, 46514.47, 77, 2.48, 57837.14, 73, 1.75, 260879.03, 72, 2.98, 2218.76, 68, 2.77, 7.11, 66, 5.53, 6770.71, 64, 2.14, 25132.30, 59, 2.20, 13521.75, 58, 4.28, 16984.00, 50, 3.94, 25661.30, 50, 2.48, 30639.86, 49, 4.85, 37410.57, 46, 0.82, 25558.21, 46, 1.56, 27147.29, 45, 5.79, 3442.57, 44, 4.94, 213.30, 43, 5.09, 10213.29, 42, 5.54, 83925.04, 37, 1.40, 77204.33, 36, 2.34, 32858.61, 35, 3.59, 26068.23, 34, 0.50, 22645.33, 33, 5.23, 25448.01, 32, 1.26, 14765.24, 31, 6.21, 26080.79, 31, 6.07, 28306.66, 30, 4.45, 7238.68, 30, 0.14, 50586.73, 29, 1.64, 25021.41, 29, 0.67, 26091.78, 28, 2.51, 26107.57, 28, 3.54, 72602.38, 27, 5.64, 1589.07, 27, 0.88, 52705.50, 26, 2.78, 103242.23, 25, 5.80, 26095.02, 25, 4.35, 41962.52, 24, 1.16, 25035.63, 23, 5.44, 26084.02, 23, 1.85, 36301.19, 21, 5.16, 51220.21, 21, 1.07, 43071.90, 20, 2.96, 23969.14, 20, 4.44, 103292.23, 20, 0.84, 12566.15, 20, 4.68, 286966.93, 18, 1.81, 26301.20, 18, 5.18, 426.60, 17, 2.29, 110012.94, 17, 4.63, 53235.19, 17, 1.26, 33326.58, 16, 5.53, 56727.76, 16, 0.08, 23869.15, 16, 4.66, 79373.09, 16, 3.76, 73711.76, 14, 1.14, 68050.42, 14, 1.45, 51646.12, 13, 3.80, 19317.19, 13, 1.73, 12432.04,
/*L2*/  530498, 0.000000, 0.000000, 169037, 4.690723, 26087.903142, 73967, 1.34736, 52175.80628, 30183, 4.45644, 78263.70942, 11074, 1.26227, 104351.61257, 3782, 4.3200, 130439.5157, 1230, 1.0687, 156527.4188, 387, 4.080, 182615.322, 149, 4.633, 1109.379, 119, 0.792, 208703.225, 52, 4.72, 24978.52, 36, 3.77, 234791.13, 26, 1.44, 27197.28, 20, 1.50, 51066.43, 11, 0.46, 260879.03, 10, 1.80, 955.60, 8, 4.54, 77154.33,
/*L3*/  1881, 0.0347, 52175.8063, 1422, 3.1251, 26087.9031, 969, 3.004, 78263.709, 437, 6.019, 104351.613, 354, 0.000, 0.000, 180, 2.775, 130439.516, 70, 5.82, 156527.42, 26, 2.57, 182615.32, 9, 5.59, 208703.23, 3, 2.32, 234791.13,
/*L4*/  1141, 3.1416, 0.0000, 32, 2.03, 26087.90, 19, 1.42, 78263.71, 17, 4.50, 52175.81, 12, 4.50, 104351.61, 6, 1.27, 130439.52, 3, 4.31, 156527.42, 1, 1.06, 182615.32, 1, 4.09, 208703.23,
/*L5*/  9, 3.14, 0.00, 1, 3.38, 52175.81,
/*B0*/  117375290, 1.983574988, 26087.903141574, 23880770, 5.03738960, 52175.80628315, 12228395, 3.14159265, 0.00000000, 5432518, 1.7964436, 78263.7094247, 1297788, 4.8323250, 104351.6125663, 318669, 1.580885, 130439.515708, 79633, 4.60972, 156527.41885, 20142, 1.35324, 182615.32199, 5140, 4.3784, 208703.2251, 2086, 2.0202, 24978.5246, 2077, 4.9177, 27197.2817, 1320, 1.1191, 234791.1283, 1214, 1.8127, 53285.1848, 1005, 5.6568, 20426.5711, 992, 0.094, 51116.424, 946, 1.242, 31749.235, 916, 2.282, 25028.521, 843, 5.085, 51066.428, 788, 4.407, 57837.138, 777, 0.526, 1059.382, 499, 3.498, 5661.332, 465, 3.237, 77204.327, 448, 4.878, 79373.088, 408, 2.466, 46514.474, 374, 4.458, 4551.953, 359, 1.091, 1109.379, 341, 4.142, 260879.031, 320, 1.185, 83925.041, 318, 2.415, 47623.853, 310, 3.503, 21535.950, 287, 1.848, 77154.331, 258, 2.776, 27043.503, 252, 3.591, 27147.285, 202, 3.068, 51646.115, 201, 4.066, 25132.303, 186, 5.584, 73711.756, 170, 6.137, 41962.521, 170, 0.028, 103292.231, 158, 3.796, 529.691, 156, 6.077, 53131.406, 150, 1.647, 105460.991, 142, 0.331, 10213.286, 140, 5.528, 72602.377, 130, 3.480, 37410.567, 129, 4.817, 30639.857, 124, 4.051, 39609.655, 123, 3.166, 14765.239, 113, 0.113, 13521.751, 112, 0.557, 63498.470, 110, 5.797, 51749.208, 110, 4.232, 110012.945, 107, 1.537, 25661.305, 105, 5.830, 50586.733, 102, 2.879, 12566.152, 99, 0.95, 65697.56, 98, 1.66, 24498.83, 94, 1.82, 15874.62, 92, 6.16, 77734.02, 91, 4.89, 103242.23, 90, 1.04, 426.60, 89, 0.40, 53235.19, 88, 0.88, 286966.93, 88, 5.81, 11322.66, 87, 3.04, 68050.42, 85, 1.05, 1589.07, 83, 5.27, 25558.21, 82, 0.84, 51220.21, 76, 3.44, 36301.19, 73, 2.37, 99799.66, 71, 5.74, 26617.59, 66, 2.67, 52705.50, 58, 6.25, 33326.58, 57, 2.87, 79219.31,
/*B1*/  4291514, 3.5016978, 26087.9031416, 1462337, 3.1415927, 0.0000000, 226753, 0.015154, 52175.806283, 108950, 0.485402, 78263.709425, 63535, 3.42944, 104351.61257, 24957, 0.16051, 130439.51571, 8596, 3.1845, 156527.4188, 2775, 6.2102, 182615.3220, 862, 2.952, 208703.225, 277, 0.291, 27197.282, 261, 5.977, 234791.128, 128, 3.377, 53285.185, 127, 0.538, 24978.525, 78, 2.72, 260879.03, 75, 3.58, 51066.43, 62, 2.92, 31749.24, 55, 1.97, 51116.42, 35, 0.11, 79373.09, 34, 0.35, 77154.33, 29, 5.95, 57837.14, 27, 0.99, 25028.52,
/*B2*/  118309, 4.790656, 26087.903142, 19135, 0.00000, 0.00000, 10448, 1.21217, 52175.80628, 2662, 4.4342, 78263.7094, 1703, 1.6226, 104351.6126, 963, 4.800, 130439.516, 447, 1.608, 156527.419, 183, 4.669, 182615.322, 69, 1.43, 208703.23, 25, 4.47, 234791.13, 17, 1.83, 27197.28, 9, 1.23, 260879.03,
/*B3*/  2354, 0.3539, 26087.9031, 1605, 0.0000, 0.0000, 189, 4.363, 52175.806, 64, 2.51, 78263.71, 46, 6.14, 104351.61, 31, 3.12, 130439.52, 17, 6.27, 156527.42, 9, 3.08, 182615.32, 4, 6.15, 208703.23,
/*B4*/  43, 1.75, 26087.90, 10, 3.14, 0.00, 4, 4.03, 52175.81, 3, 0.21, 78263.71, 1, 3.75, 104351.61, 1, 1.18, 130439.52, 1, 4.55, 156527.42,
/*B5*/  1, 3.95, 26087.90, 1, 3.14, 0.00,
/*R0*/  395282717, 0.000000000, 0.000000000, 78341318, 6.19233723, 26087.90314157, 7955256, 2.9598969, 52175.8062831, 1212818, 6.0106415, 78263.7094247, 219220, 2.778201, 104351.612566, 43541, 5.82895, 130439.51571, 9182, 2.5965, 156527.4188, 2900, 1.4244, 25028.5212, 2600, 3.0282, 27197.2817, 2019, 5.6473, 182615.3220, 2015, 5.5923, 31749.2352, 1420, 6.2526, 24978.5246, 1001, 3.7344, 21535.9496, 776, 3.670, 20426.571, 755, 4.474, 51116.424, 668, 2.525, 5661.332, 633, 4.299, 25558.212, 630, 4.766, 1059.382, 483, 6.068, 53285.185, 457, 2.415, 208703.225, 442, 1.220, 15874.618, 408, 2.359, 57837.138, 372, 0.517, 47623.853, 352, 1.059, 27043.503, 339, 0.864, 25661.305, 309, 0.884, 24498.830, 301, 1.795, 37410.567, 284, 3.021, 51066.428, 261, 2.150, 39609.655, 213, 5.369, 13521.751, 194, 4.984, 10213.286, 187, 4.965, 11322.664, 171, 1.241, 77204.327, 169, 3.888, 26617.594, 163, 2.633, 19804.827, 151, 0.445, 46514.474, 150, 4.282, 41962.521, 140, 4.771, 33326.579, 139, 1.626, 27147.285, 139, 2.000, 25132.303, 134, 1.077, 51646.115, 128, 6.064, 1109.379, 128, 2.076, 529.691, 121, 2.850, 79373.088, 119, 2.365, 4551.953, 106, 5.466, 234791.128, 95, 0.84, 12566.15, 94, 5.41, 83925.04, 91, 1.21, 14765.24, 89, 3.88, 50586.73, 85, 3.57, 73711.76, 77, 3.92, 51749.21, 75, 2.45, 30639.86, 75, 5.53, 32858.61, 72, 1.17, 16984.00, 71, 5.33, 426.60, 69, 5.31, 1589.07, 69, 1.82, 36301.19, 66, 4.28, 43071.90, 65, 6.07, 77154.33, 59, 4.07, 53131.41, 54, 5.20, 65697.56, 52, 3.57, 6283.08, 44, 5.69, 45892.73, 41, 1.65, 25448.01, 41, 3.68, 22645.33, 41, 4.29, 103292.23, 36, 2.96, 28306.66, 34, 0.65, 52705.50, 34, 3.49, 72602.38, 33, 3.14, 25874.60, 33, 1.03, 68050.42, 31, 4.13, 77734.02, 30, 5.91, 105460.99, 28, 4.63, 18849.23, 28, 5.05, 51220.21, 28, 5.68, 26107.57, 27, 4.68, 53235.19, 27, 4.75, 63498.47, 27, 3.57, 26068.23, 26, 2.95, 26080.79, 25, 0.35, 23969.14, 25, 2.23, 260879.03, 23, 0.50, 32370.98, 23, 2.18, 110012.94, 21, 0.85, 76674.64, 21, 2.19, 26301.20, 20, 0.34, 99799.66, 20, 0.47, 48733.23, 20, 3.77, 19317.19, 20, 1.37, 7238.68, 19, 2.37, 6770.71, 19, 0.69, 26091.78, 19, 3.93, 38654.05, 19, 2.27, 26084.02, 18, 4.21, 25938.34, 18, 0.92, 79219.31, 18, 5.51, 56727.76, 17, 0.68, 77837.11, 17, 4.29, 40853.14, 17, 2.15, 26514.50, 17, 4.98, 9103.91, 16, 4.66, 25021.41, 16, 1.28, 25035.63, 16, 5.85, 26095.02, 16, 2.84, 103242.23, 15, 1.55, 955.60, 15, 2.16, 27676.98, 14, 0.06, 23869.15, 14, 4.85, 62389.09, 12, 1.97, 91785.46, 12, 1.73, 38519.95, 11, 4.56, 26011.64, 10, 2.78, 213.30, 10, 1.06, 129380.13, 10, 2.44, 71980.63, 10, 4.71, 51535.91, 10, 2.54, 29530.48,
/*R1*/  2173477, 4.6561716, 26087.9031416, 441418, 1.423855, 52175.806283, 100945, 4.474663, 78263.709425, 24328, 1.24226, 104351.61257, 16244, 0.00000, 0.00000, 6040, 4.2930, 130439.5157, 1529, 1.0606, 156527.4188, 392, 4.111, 182615.322, 180, 4.712, 24978.525, 178, 4.544, 27197.282, 102, 0.879, 208703.225, 81, 3.01, 25028.52, 44, 2.14, 20426.57, 44, 1.48, 51066.43, 35, 3.21, 1059.38, 31, 5.24, 21535.95, 27, 3.93, 234791.13, 25, 2.03, 24498.83, 20, 1.24, 53285.18, 20, 4.05, 5661.33, 15, 2.62, 26617.59, 15, 2.36, 27043.50, 14, 1.38, 1109.38, 13, 5.19, 46514.47, 13, 0.56, 25132.30, 12, 0.21, 11322.66, 12, 4.53, 77154.33, 11, 0.86, 57837.14, 11, 6.24, 27147.29, 10, 3.28, 37410.57, 9, 2.37, 25661.30, 9, 5.55, 25558.21, 8, 5.96, 14765.24, 7, 0.78, 32858.61, 7, 4.07, 1589.07, 7, 2.71, 16984.00, 7, 0.93, 30639.86, 7, 0.70, 260879.03, 7, 2.02, 26068.23, 6, 0.86, 4551.95, 6, 3.66, 25448.01, 6, 4.50, 28306.66, 6, 4.65, 26080.79, 6, 3.50, 10213.29, 6, 0.63, 13521.75, 5, 5.38, 26091.78, 5, 0.94, 26107.57, 5, 5.22, 22645.33, 5, 0.06, 25021.41, 5, 3.89, 83925.04, 5, 4.84, 50586.73, 5, 5.55, 12566.15, 5, 4.24, 26095.02, 5, 6.01, 77204.33, 5, 0.73, 529.69, 4, 3.87, 26084.02, 4, 5.87, 25035.63, 4, 5.79, 43071.90, 4, 0.26, 36301.19, 4, 2.78, 41962.52, 4, 5.60, 52705.50, 4, 3.82, 426.60, 4, 1.96, 72602.38, 4, 6.00, 33326.58,
/*R2*/  31179, 3.08232, 26087.90314, 12454, 6.15183, 52175.80628, 4248, 2.9258, 78263.7094, 1361, 5.9798, 104351.6126, 422, 2.749, 130439.516, 218, 3.142, 0.000, 128, 5.801, 156527.419, 38, 2.57, 182615.32, 11, 5.62, 208703.23, 10, 3.15, 24978.52, 5, 6.14, 27197.28, 3, 2.39, 234791.13, 3, 6.21, 51066.43,
/*R3*/  327, 1.680, 26087.903, 242, 4.634, 52175.806, 121, 1.390, 78263.709, 51, 4.44, 104351.61, 20, 1.21, 130439.52, 15, 3.14, 0.00, 7, 4.26, 156527.42, 3, 1.03, 182615.32, 1, 4.08, 208703.23,
/*R4*/  4, 0.37, 26087.90, 4, 3.19, 52175.81, 3, 6.17, 78263.71, 1, 2.92, 104351.61, 1, 5.96, 130439.52),

  //Dven精度:J2000+-4千年 黄经0.2角秒 黄纬0.2角秒 距离0.2AU/10^6
  new Array(
    1000000000,//A的倍率
    20, 257, 374, 425, 437, 449, 458, 566, 629, 641, 653, 665, 668, 929, 1040, 1082, 1091, 1094, 1094,//位置索引表
/*L0*/  3176146668, 0.0000000000, 0.0000000000, 13539684, 5.59313320, 10213.28554621, 898916, 5.306500, 20426.571092, 54772, 4.41631, 7860.41939, 34557, 2.69964, 11790.62909, 23721, 2.99378, 3930.20970, 16641, 4.25019, 1577.34354, 14383, 4.15745, 9683.59458, 13171, 5.18668, 26.29832, 12005, 6.15357, 30639.85664, 7693, 0.8163, 9437.7629, 7614, 1.9501, 529.6910, 7077, 1.0647, 775.5226, 5848, 3.9984, 191.4483, 4999, 4.1234, 15720.8388, 4295, 3.5864, 19367.1892, 3270, 5.6774, 5507.5532, 3262, 4.5906, 10404.7338, 2319, 3.1625, 9153.9036, 1797, 4.6534, 1109.3786, 1555, 5.5704, 19651.0485, 1283, 4.2260, 20.7754, 1279, 0.9621, 5661.3320, 1055, 1.5372, 801.8209, 991, 0.833, 213.299, 988, 5.394, 13367.973, 880, 3.889, 9999.986, 857, 0.356, 3154.687, 821, 3.216, 18837.498, 716, 0.111, 11015.106, 702, 0.675, 23581.258, 561, 4.240, 7.114, 508, 0.245, 11322.664, 461, 5.316, 18073.705, 446, 6.063, 40853.142, 426, 1.800, 7084.897, 426, 5.329, 2352.866, 412, 0.362, 382.897, 357, 2.704, 10206.172, 339, 2.023, 6283.076, 333, 2.100, 27511.468, 302, 4.942, 13745.346, 299, 4.022, 10239.584, 293, 3.514, 283.859, 291, 3.592, 22003.915, 285, 2.224, 1059.382, 263, 0.541, 17298.182, 244, 2.702, 8624.213, 243, 4.278, 5.523, 237, 4.829, 6872.673, 205, 0.585, 38.028, 203, 3.795, 14143.495, 191, 6.120, 29050.784, 190, 4.138, 4551.953, 183, 3.047, 19999.973, 171, 3.522, 31441.678, 159, 1.501, 8635.942, 137, 4.413, 3532.061, 118, 1.913, 21228.392, 116, 5.810, 19896.880, 110, 2.584, 9786.687, 110, 2.846, 18307.807, 106, 0.854, 10596.182, 101, 2.343, 10742.977, 99, 1.09, 7064.12, 94, 4.95, 35371.89, 92, 5.52, 12566.15, 89, 1.97, 10186.99, 82, 1.92, 15.25, 70, 1.00, 632.78, 68, 4.40, 8662.24, 67, 1.55, 14945.32, 64, 2.18, 10988.81, 63, 0.36, 103.09, 60, 5.05, 245.83, 60, 2.97, 4732.03, 58, 1.93, 3340.61, 56, 0.49, 522.58, 55, 3.37, 25158.60,
/*L1*/  10213529430529, 0.000000000000, 0.000000000000, 957077, 2.464244, 10213.285546, 144450, 0.516246, 20426.571092, 2134, 1.7955, 30639.8566, 1739, 2.6554, 26.2983, 1517, 6.1064, 1577.3435, 822, 5.702, 191.448, 697, 2.681, 9437.763, 524, 3.600, 775.523, 383, 1.034, 529.691, 296, 1.251, 5507.553, 251, 6.107, 10404.734, 178, 6.194, 1109.379, 165, 2.643, 7.114, 142, 5.451, 9153.904, 126, 1.245, 40853.142, 126, 1.881, 382.897, 116, 4.976, 213.299, 89, 0.95, 13367.97, 74, 4.39, 10206.17, 67, 5.06, 801.82, 66, 2.28, 2352.87, 63, 4.08, 3154.69, 49, 3.45, 11015.11, 43, 0.08, 6283.08, 41, 4.12, 18837.50, 37, 2.48, 5661.33, 36, 1.48, 1059.38, 35, 6.20, 5.52, 34, 1.77, 11322.66, 30, 2.24, 18073.70, 30, 0.39, 15.25, 30, 5.35, 7084.90, 28, 1.46, 10239.58, 26, 0.35, 22003.91, 24, 2.36, 10596.18, 23, 2.37, 17298.18, 22, 2.08, 8635.94, 21, 4.47, 8624.21,
/*L2*/  541271, 0.000000, 0.000000, 38915, 0.34514, 10213.28555, 13379, 2.02011, 20426.57109, 238, 2.046, 26.298, 193, 3.535, 30639.857, 100, 3.971, 775.523, 70, 1.52, 1577.34, 60, 1.00, 191.45, 32, 4.36, 9437.76, 21, 2.66, 40853.14, 19, 3.39, 382.90, 15, 6.05, 529.69, 13, 2.95, 5507.55, 12, 3.73, 3154.69, 10, 3.53, 11015.11, 10, 1.41, 10404.73, 10, 5.11, 801.82,
/*L3*/  1357, 4.8039, 10213.2855, 778, 3.669, 20426.571, 260, 0.000, 0.000, 12, 5.32, 30639.86,
/*L4*/  1140, 3.1416, 0.0000, 32, 5.21, 20426.57, 17, 2.51, 10213.29, 1, 0.71, 30639.86,
/*L5*/  9, 3.14, 0.00, 1, 1.91, 10213.29, 1, 0.55, 20426.57,
/*B0*/  59236385, 0.26702776, 10213.28554621, 401080, 1.147372, 20426.571092, 328149, 3.141593, 0.000000, 10114, 1.08946, 30639.85664, 1495, 6.2539, 18073.7049, 1378, 0.8602, 1577.3435, 1300, 3.6715, 9437.7629, 1195, 3.7047, 2352.8662, 1080, 4.5390, 22003.9146, 920, 1.540, 9153.904, 530, 2.281, 5507.553, 456, 0.723, 10239.584, 435, 6.140, 11790.629, 417, 5.991, 19896.880, 396, 3.868, 8635.942, 392, 3.950, 529.691, 389, 2.934, 10186.987, 333, 4.832, 14143.495, 237, 2.906, 10988.808, 235, 2.008, 13367.973, 218, 2.697, 19651.048, 207, 0.987, 775.523, 186, 1.805, 40853.142, 178, 5.963, 25934.124, 170, 4.137, 10021.837, 154, 3.296, 11015.106, 149, 5.611, 10404.734, 131, 5.707, 9683.595, 129, 5.427, 29580.475, 120, 3.576, 10742.977, 118, 1.191, 8624.213, 115, 5.128, 6283.076, 98, 0.15, 20618.02, 95, 2.75, 191.45, 86, 0.43, 9786.69, 81, 1.31, 15720.84,
/*B1*/  5133476, 1.8036431, 10213.2855462, 43801, 3.38616, 20426.57109, 1992, 0.0000, 0.0000, 1966, 2.5300, 30639.8566, 140, 2.271, 9437.763, 130, 1.507, 18073.705, 119, 5.605, 1577.344, 103, 5.242, 2352.866, 93, 6.08, 22003.91, 80, 0.29, 9153.90, 75, 5.08, 10186.99, 74, 1.50, 11790.63, 47, 3.88, 10239.58, 47, 0.75, 5507.55, 44, 3.59, 40853.14, 40, 1.28, 10404.73, 38, 4.33, 19651.05, 36, 1.26, 19896.88, 35, 5.51, 529.69, 34, 4.89, 10988.81, 29, 0.09, 14143.50,
/*B2*/  223777, 3.385091, 10213.285546, 2817, 0.0000, 0.0000, 1732, 5.2556, 20426.5711, 269, 3.870, 30639.857,
/*B3*/  6467, 4.9917, 10213.2855, 200, 3.142, 0.000, 55, 0.77, 20426.57, 25, 5.44, 30639.86,
/*B4*/  141, 0.315, 10213.286, 2, 3.14, 0.00, 2, 2.35, 20426.57, 2, 0.74, 30639.86,
/*B5*/  2, 2.05, 10213.29,
/*R0*/  723348209, 0.000000000, 0.000000000, 4898242, 4.0215183, 10213.2855462, 16581, 4.90207, 20426.57109, 16321, 2.84549, 7860.41939, 13780, 1.12847, 11790.62909, 4984, 2.5868, 9683.5946, 3740, 1.4231, 3930.2097, 2636, 5.5294, 9437.7629, 2375, 2.5514, 15720.8388, 2220, 2.0135, 19367.1892, 1259, 2.7277, 1577.3435, 1195, 3.0198, 10404.7338, 853, 3.986, 19651.048, 762, 1.596, 9153.904, 743, 4.120, 5507.553, 425, 3.819, 13367.973, 419, 1.643, 18837.498, 394, 5.390, 23581.258, 313, 2.318, 9999.986, 290, 5.677, 5661.332, 276, 5.724, 775.523, 273, 4.822, 11015.106, 198, 0.532, 27511.468, 197, 4.962, 11322.664, 162, 0.565, 529.691, 136, 3.755, 18073.705, 132, 3.372, 13745.346, 131, 5.244, 17298.182, 129, 1.134, 10206.172, 118, 5.090, 3154.687, 117, 0.234, 7084.897, 114, 4.568, 29050.784, 108, 2.450, 10239.584, 107, 1.955, 31441.678, 104, 1.202, 15874.618, 96, 1.47, 19999.97, 93, 1.62, 2352.87, 91, 3.07, 1109.38, 84, 5.78, 30639.86, 82, 1.95, 22003.91, 76, 1.14, 8624.21, 65, 2.17, 14143.50, 64, 0.84, 6283.08, 62, 3.26, 6872.67, 61, 0.35, 21228.39, 60, 3.38, 35371.89, 59, 0.01, 8635.94, 56, 3.95, 12566.15, 55, 1.27, 18307.81, 45, 4.73, 19896.88, 45, 2.48, 191.45, 43, 2.60, 4551.95, 40, 0.00, 801.82, 39, 5.57, 10596.18, 39, 1.01, 9786.69, 35, 4.80, 39302.10, 33, 0.71, 10742.98, 32, 0.40, 10186.99, 32, 1.81, 25158.60, 31, 6.26, 14945.32, 30, 4.21, 28521.09, 27, 5.80, 7064.12, 25, 0.69, 10988.81, 24, 3.78, 21535.95, 22, 2.83, 8662.24, 21, 6.22, 43232.31, 20, 5.42, 16496.36, 20, 2.21, 19786.67, 19, 2.86, 3532.06, 19, 2.63, 29580.47, 19, 1.50, 10021.84, 18, 3.23, 29088.81, 18, 0.42, 4705.73, 17, 3.68, 26.30, 15, 0.00, 17277.41, 15, 2.48, 31749.24, 14, 5.86, 9676.48, 14, 5.18, 10316.38, 13, 2.49, 9690.71, 13, 1.36, 47162.52, 13, 5.25, 19360.08, 12, 1.88, 19374.30, 12, 5.56, 6770.71, 12, 1.42, 4732.03, 12, 1.43, 18875.53, 11, 5.92, 13936.79, 11, 4.64, 33019.02,
/*R1*/  345510, 0.891987, 10213.285546, 2342, 1.7722, 20426.5711, 2340, 3.1416, 0.0000, 239, 1.113, 9437.763, 106, 4.592, 1577.344, 91, 4.54, 10404.73, 66, 5.98, 5507.55, 47, 3.88, 9153.90, 38, 5.66, 13367.97, 27, 2.82, 10206.17, 22, 2.05, 775.52, 21, 2.55, 18837.50, 18, 1.88, 11015.11, 18, 2.65, 30639.86, 13, 0.21, 11322.66, 12, 0.79, 17298.18, 11, 4.95, 6283.08, 10, 6.17, 10239.58, 9, 4.60, 1109.38, 9, 0.81, 10596.18, 9, 2.48, 3154.69, 9, 0.67, 18073.70, 8, 5.59, 12566.15, 8, 0.44, 8635.94, 8, 5.49, 529.69, 8, 3.75, 7084.90, 8, 0.90, 5661.33, 7, 2.87, 8624.21, 7, 5.07, 22003.91, 6, 4.10, 191.45, 6, 3.14, 10186.99, 6, 2.25, 21228.39, 6, 2.17, 18307.81, 5, 5.87, 2352.87, 5, 5.33, 14143.50, 5, 4.34, 9786.69, 5, 5.56, 10742.98,
/*R2*/  14066, 5.06366, 10213.28555, 155, 5.473, 20426.571, 131, 0.000, 0.000, 11, 2.79, 9437.76, 5, 6.28, 1577.34, 4, 1.95, 11015.11, 4, 2.33, 775.52, 4, 6.12, 10404.73, 3, 1.39, 5507.55, 2, 5.63, 10239.58, 2, 6.17, 30639.86, 2, 1.11, 13367.97, 2, 3.64, 7084.90, 2, 2.22, 3154.69,
/*R3*/  496, 3.223, 10213.286, 8, 3.21, 20426.57, 1, 3.14, 0.00,
/*R4*/  6, 0.92, 10213.29),

  //Dmar精度:J2000+-4千年 黄经0.5角秒 黄纬0.5角秒 距离1AU/10^6
  new Array(
    1000000000,//A的倍率
    20, 596, 1028, 1289, 1385, 1427, 1454, 1586, 1670, 1694, 1709, 1718, 1724, 2360, 2873, 3155, 3239, 3275, 3287,//位置索引表
/*L0*/  6203477116, 0.0000000000, 0.0000000000, 186563681, 5.050371003, 3340.612426700, 11082168, 5.40099837, 6681.22485340, 917984, 5.754787, 10021.837280, 277450, 5.970495, 3.523118, 123159, 0.849561, 2810.921462, 106102, 2.939585, 2281.230497, 89268, 4.15698, 0.01725, 87157, 6.11005, 13362.44971, 77749, 3.33969, 5621.84292, 67976, 0.36462, 398.14900, 41611, 0.22815, 2942.46342, 35751, 1.66187, 2544.31442, 30753, 0.85697, 191.44827, 29375, 6.07894, 0.06731, 26281, 0.64806, 3337.08931, 25798, 0.02997, 3344.13555, 23894, 5.03896, 796.29801, 17988, 0.65634, 529.69097, 15464, 2.91580, 1751.53953, 15281, 1.14979, 6151.53389, 12862, 3.06796, 2146.16542, 12644, 3.62275, 5092.15196, 10249, 3.69334, 8962.45535, 8916, 0.1829, 16703.0621, 8588, 2.4009, 2914.0142, 8327, 4.4950, 3340.6297, 8327, 2.4642, 3340.5952, 7487, 3.8225, 155.4204, 7239, 0.6750, 3738.7614, 7129, 3.6634, 1059.3819, 6552, 0.4886, 3127.3133, 6356, 2.9218, 8432.7644, 5527, 4.4748, 1748.0164, 5505, 3.8100, 0.9803, 4722, 3.6255, 1194.4470, 4260, 0.5537, 6283.0758, 4151, 0.4966, 213.2991, 3121, 0.9985, 6677.7017, 3066, 0.3805, 6684.7480, 3024, 4.4862, 3532.0607, 2994, 2.7832, 6254.6267, 2932, 4.2213, 20.7754, 2836, 5.7689, 3149.1642, 2811, 5.8816, 1349.8674, 2740, 0.1337, 3340.6797, 2740, 0.5422, 3340.5451, 2389, 5.3716, 4136.9104, 2361, 5.7550, 3333.4989, 2312, 1.2824, 3870.3034, 2212, 3.5047, 382.8965, 2042, 2.8213, 1221.8486, 1931, 3.3572, 3.5904, 1886, 1.4910, 9492.1463, 1792, 1.0056, 951.7184, 1741, 2.4136, 553.5694, 1721, 0.4394, 5486.7778, 1600, 3.9485, 4562.4610, 1443, 1.4187, 135.0651, 1399, 3.3259, 2700.7151, 1382, 4.3015, 7.1135, 1310, 4.0449, 12303.0678, 1281, 2.2081, 1592.5960, 1281, 1.8067, 5088.6288, 1169, 3.1281, 7903.0734, 1135, 3.7007, 1589.0729, 1104, 1.0520, 242.7286, 1045, 0.7854, 8827.3903, 1001, 3.2434, 11773.3768, 989, 4.846, 6681.242, 989, 2.815, 6681.208, 956, 0.540, 20043.675, 869, 2.202, 11243.686, 868, 1.021, 7079.374, 842, 3.990, 4399.994, 837, 3.203, 4690.480, 750, 0.766, 6467.926, 735, 2.184, 8429.241, 721, 5.847, 5884.927, 714, 2.803, 3185.192, 690, 3.764, 6041.328, 684, 2.738, 2288.344, 667, 0.736, 3723.509, 653, 2.681, 28.449, 634, 0.913, 3553.912, 633, 4.528, 426.598, 617, 6.168, 2274.117, 566, 5.063, 15.252, 564, 1.687, 6872.673, 559, 3.463, 263.084, 555, 4.606, 4292.331, 523, 0.899, 9623.688, 517, 2.813, 3339.632, 513, 4.148, 3341.593, 485, 3.957, 4535.059, 459, 0.287, 5614.729, 458, 0.788, 1990.745, 442, 3.195, 5628.956, 419, 3.583, 8031.092, 412, 6.020, 3894.182, 407, 3.138, 9595.239, 395, 5.632, 3097.884, 388, 1.352, 10018.314, 384, 5.829, 3191.049, 382, 2.348, 162.467, 381, 0.734, 10025.360, 378, 4.155, 2803.808, 371, 0.685, 2818.035, 367, 2.637, 692.158, 340, 2.595, 11769.854, 336, 6.120, 6489.777, 331, 1.140, 5.523, 326, 0.484, 6681.292, 326, 0.893, 6681.158, 312, 3.982, 20.355, 290, 2.427, 3319.837, 287, 5.721, 7477.523, 276, 1.597, 7210.916, 275, 6.084, 6674.111, 273, 4.556, 3361.388, 264, 1.345, 3496.033, 256, 0.250, 522.577, 255, 3.432, 3443.705, 254, 0.521, 10.637, 246, 4.003, 11371.705, 244, 0.970, 632.784, 238, 1.841, 12832.759, 231, 4.750, 3347.726, 228, 3.526, 1648.447, 227, 4.985, 7632.943, 227, 3.954, 4989.059, 226, 5.241, 3205.547, 225, 5.649, 2388.894, 223, 0.721, 266.607, 215, 6.154, 3264.346, 213, 4.282, 4032.770, 212, 3.118, 2957.716, 210, 4.279, 5099.266, 202, 3.671, 1758.653, 201, 1.082, 7064.121, 198, 2.377, 10713.995, 193, 3.239, 7.046, 184, 4.225, 2787.043, 181, 3.258, 3337.022, 180, 4.254, 2487.416, 177, 3.697, 3344.203, 176, 4.092, 74.782, 168, 5.486, 3.881, 168, 4.397, 15643.680, 166, 2.528, 14584.298, 161, 2.369, 3265.831, 161, 3.794, 2118.764, 160, 1.768, 3475.678, 160, 1.547, 14054.607, 158, 0.569, 103.093, 158, 3.132, 59.374, 146, 3.452, 7373.382, 145, 4.380, 316.392, 142, 0.598, 23.878, 140, 1.442, 10404.734, 139, 5.408, 10973.556, 137, 3.591, 15113.989, 137, 2.541, 4933.208, 135, 4.042, 4929.685, 134, 5.169, 10213.286, 133, 6.178, 1744.426, 128, 0.105, 7234.794, 127, 1.799, 13745.346, 123, 2.521, 2906.901, 123, 3.169, 10021.820, 123, 5.199, 10021.855, 122, 1.731, 36.028, 122, 4.423, 14712.317, 119, 5.480, 2921.128, 119, 4.766, 5828.028, 118, 5.727, 0.420, 109, 0.604, 5085.038, 108, 1.372, 10419.986, 107, 4.339, 7740.607, 106, 5.477, 419.485, 106, 3.450, 639.897, 106, 0.896, 23384.287, 106, 1.091, 12168.003, 100, 1.383, 3583.341, 99, 2.69, 36.61, 98, 5.84, 14314.17, 98, 3.60, 206.19, 97, 6.28, 9225.54, 96, 4.89, 3230.41, 96, 4.33, 131.54, 91, 1.10, 9808.54, 88, 3.97, 170.67,
/*L1*/  3340856274743, 0.000000000000, 0.000000000000, 14582271, 3.60426054, 3340.61242670, 1649013, 3.9263125, 6681.2248534, 199633, 4.265941, 10021.837280, 34524, 4.73210, 3.52312, 24855, 4.61278, 13362.44971, 8416, 4.4586, 2281.2305, 5376, 5.0159, 398.1490, 5210, 4.9942, 3344.1355, 4326, 2.5607, 191.4483, 4297, 5.3165, 155.4204, 3817, 3.5388, 796.2980, 3141, 4.9634, 16703.0621, 2828, 3.1597, 2544.3144, 2057, 4.5689, 2146.1654, 1688, 1.3289, 3337.0893, 1576, 4.1850, 1751.5395, 1337, 2.2333, 0.9803, 1336, 5.9742, 1748.0164, 1176, 6.0241, 6151.5339, 1166, 2.2135, 1059.3819, 1139, 2.1287, 1194.4470, 1136, 5.4280, 3738.7614, 911, 1.096, 1349.867, 853, 3.909, 553.569, 833, 5.296, 6684.748, 808, 4.428, 529.691, 795, 2.249, 8962.455, 729, 2.502, 951.718, 725, 5.842, 242.729, 715, 3.856, 2914.014, 676, 5.023, 382.897, 651, 1.018, 3340.595, 651, 3.049, 3340.630, 615, 4.152, 3149.164, 565, 3.888, 4136.910, 485, 4.874, 213.299, 476, 1.182, 3333.499, 466, 1.315, 3185.192, 413, 0.714, 1592.596, 403, 2.725, 7.114, 401, 5.316, 20043.675, 329, 5.411, 6283.076, 282, 0.045, 9492.146, 266, 3.890, 1221.849, 266, 5.113, 2700.715, 233, 6.168, 3532.061, 228, 1.545, 2274.117, 226, 0.838, 3097.884, 224, 5.466, 20.355, 223, 5.885, 3870.303, 214, 4.971, 3340.680, 214, 5.379, 3340.545, 211, 3.525, 15.252, 204, 2.364, 1589.073, 202, 3.364, 5088.629, 200, 4.731, 4690.480, 200, 5.787, 7079.374, 197, 2.578, 12303.068, 195, 0.492, 6677.702, 195, 2.531, 4399.994, 185, 5.579, 1990.745, 178, 6.125, 4292.331, 166, 1.255, 3894.182, 165, 2.603, 3341.593, 154, 2.470, 4535.059, 153, 2.265, 3723.509, 150, 1.035, 2288.344, 147, 3.370, 6681.242, 147, 1.339, 6681.208, 136, 1.977, 5614.729, 135, 2.123, 5486.778, 133, 3.422, 5621.843, 130, 1.514, 5628.956, 130, 5.619, 10025.360, 127, 2.950, 3496.033, 119, 5.476, 3553.912, 119, 3.127, 426.598, 118, 2.586, 8432.764, 114, 6.234, 135.065, 111, 5.842, 2803.808, 110, 4.158, 2388.894, 109, 5.282, 2818.035, 105, 2.736, 2787.043, 97, 4.53, 6489.78, 88, 4.23, 7477.52, 87, 4.44, 5092.15, 87, 4.33, 3339.63, 86, 3.16, 162.47, 85, 1.91, 11773.38, 84, 3.16, 3347.73, 83, 2.18, 23.88, 81, 1.61, 2957.72, 80, 5.70, 6041.33, 77, 5.72, 9623.69, 74, 6.18, 3583.34, 67, 5.08, 8031.09, 64, 2.12, 5884.93, 62, 3.54, 692.16, 61, 1.66, 6525.80, 57, 3.68, 8429.24, 55, 2.01, 522.58, 55, 6.13, 2487.42, 55, 0.19, 7632.94, 54, 1.05, 4933.21, 54, 0.18, 2942.46, 53, 2.23, 3127.31, 52, 0.37, 12832.76, 52, 1.15, 28.45, 51, 5.67, 23384.29, 50, 1.51, 1744.43, 50, 2.45, 5099.27, 49, 3.10, 5.52, 49, 5.61, 6467.93, 49, 5.29, 6681.29, 48, 5.70, 6681.16, 47, 0.23, 36.03, 47, 0.03, 7210.92, 45, 4.17, 2906.90, 44, 0.31, 10018.31, 43, 4.43, 640.88, 43, 2.88, 2810.92, 41, 1.60, 7234.79, 41, 3.96, 3.88, 38, 2.26, 2699.73, 37, 2.92, 15643.68, 35, 1.76, 1758.65, 34, 1.53, 6674.11, 34, 2.66, 4929.69, 33, 2.59, 2118.76, 32, 6.14, 10419.99, 32, 2.33, 5085.04, 32, 2.87, 7740.61, 31, 1.76, 9595.24, 31, 2.56, 7064.12, 30, 1.87, 7.05, 29, 1.28, 574.34, 28, 0.99, 3191.05, 28, 0.43, 5828.03, 28, 1.76, 639.90, 27, 3.71, 10021.85, 27, 1.68, 10021.82, 26, 3.12, 6836.65, 26, 3.77, 2921.13,
/*L2*/  580158, 2.049795, 3340.612427, 541876, 0.000000, 0.000000, 139084, 2.457424, 6681.224853, 24651, 2.80000, 10021.83728, 3984, 3.1412, 13362.4497, 2220, 3.1944, 3.5231, 1210, 0.5433, 155.4204, 615, 3.485, 16703.062, 536, 3.542, 3344.136, 343, 6.002, 2281.230, 317, 4.140, 191.448, 298, 1.999, 796.298, 232, 4.334, 242.729, 217, 3.445, 398.149, 204, 5.422, 553.569, 162, 0.657, 0.980, 160, 6.110, 2146.165, 156, 1.221, 1748.016, 149, 6.095, 3185.192, 144, 4.019, 951.718, 143, 2.619, 1349.867, 134, 0.602, 1194.447, 119, 3.861, 6684.748, 113, 4.718, 2544.314, 104, 0.250, 382.897, 95, 0.68, 1059.38, 92, 3.83, 20043.67, 90, 3.88, 3738.76, 75, 5.46, 1751.54, 69, 2.58, 3149.16, 67, 2.38, 4136.91, 65, 5.48, 1592.60, 63, 2.34, 3097.88, 59, 1.15, 7.11, 48, 2.90, 3333.50, 46, 4.43, 6151.53, 42, 3.69, 5614.73, 40, 6.12, 5628.96, 37, 4.07, 1990.75, 36, 2.47, 529.69, 33, 0.68, 8962.46, 33, 2.80, 3894.18, 31, 4.57, 3496.03, 29, 5.41, 2914.01, 29, 1.23, 2787.04, 29, 3.41, 3337.09, 28, 1.39, 4292.33, 26, 4.68, 3583.34, 26, 1.04, 3341.59, 26, 2.65, 2388.89, 26, 1.50, 3340.63, 26, 5.75, 3340.60, 24, 0.96, 4535.06, 24, 1.05, 4399.99, 24, 4.27, 7079.37, 24, 4.85, 9492.15, 23, 4.18, 10025.36, 23, 0.01, 4690.48, 22, 3.26, 213.30, 22, 0.16, 6525.80, 21, 0.48, 2700.72, 18, 0.97, 1589.07, 18, 2.52, 2810.92, 18, 3.81, 3723.51, 16, 1.11, 12303.07, 16, 4.94, 1221.85, 16, 4.96, 5088.63, 15, 2.93, 640.88, 15, 0.11, 2957.72, 14, 2.98, 6489.78, 14, 1.54, 3347.73, 14, 3.86, 6283.08, 14, 2.73, 7477.52, 14, 4.18, 23384.29, 13, 5.30, 6677.70, 12, 3.77, 2699.73, 12, 6.14, 6681.21, 12, 1.89, 6681.24, 12, 1.51, 426.60, 11, 3.78, 3870.30, 11, 5.05, 5621.84, 11, 3.81, 3553.91, 10, 5.83, 4933.21, 9, 1.91, 3532.06, 9, 3.82, 5092.15, 9, 4.13, 162.47, 9, 3.83, 3340.55,
/*L3*/  14824, 0.44435, 3340.61243, 6621, 0.8847, 6681.2249, 1883, 1.2880, 10021.8373, 415, 1.649, 13362.450, 260, 0.000, 0.000, 227, 2.053, 155.420, 105, 1.580, 3.523, 80, 2.00, 16703.06, 49, 2.82, 242.73, 38, 2.02, 3344.14, 32, 4.59, 3185.19, 31, 0.65, 553.57, 17, 5.54, 951.72, 15, 5.72, 191.45, 14, 0.46, 796.30, 14, 2.34, 20043.67, 13, 5.36, 0.98, 12, 4.15, 1349.87, 11, 2.38, 6684.75, 10, 1.77, 382.90, 9, 5.34, 1194.45, 8, 2.75, 1748.02, 6, 3.18, 3583.34, 6, 6.11, 3496.03, 6, 5.86, 7.11, 6, 1.85, 398.15, 5, 4.93, 6525.80, 5, 1.01, 3149.16, 5, 0.84, 4136.91, 5, 5.98, 2787.04, 4, 1.27, 2281.23, 4, 2.33, 3738.76,
/*L4*/  1140, 3.1416, 0.0000, 287, 5.637, 6681.225, 244, 5.139, 3340.612, 112, 6.032, 10021.837, 33, 0.13, 13362.45, 32, 3.56, 155.42, 8, 0.49, 16703.06, 8, 1.32, 242.73, 5, 3.06, 3185.19, 4, 2.16, 553.57, 3, 6.23, 3.52, 2, 0.44, 3344.14, 2, 0.82, 20043.67, 2, 3.74, 3496.03,
/*L5*/  9, 3.14, 0.00, 7, 4.04, 6681.22, 5, 4.49, 10021.84, 4, 5.07, 155.42, 2, 3.51, 3340.61, 2, 4.85, 13362.45, 1, 6.09, 242.73, 1, 5.19, 16703.06, 1, 1.56, 3185.19,
/*B0*/  31971350, 3.76832042, 3340.61242670, 2980332, 4.1061700, 6681.2248534, 2891047, 0.0000000, 0.0000000, 313655, 4.446511, 10021.837280, 34841, 4.78813, 13362.44971, 4434, 5.0264, 3344.1355, 4430, 5.6523, 3337.0893, 3991, 5.1306, 16703.0621, 2925, 3.7929, 2281.2305, 1820, 6.1365, 6151.5339, 1632, 4.2640, 529.6910, 1597, 2.2319, 1059.3819, 1493, 2.1650, 5621.8429, 1427, 1.1822, 3340.5952, 1427, 3.2129, 3340.6297, 1393, 2.4180, 8962.4553, 864, 5.744, 3738.761, 833, 5.989, 6677.702, 825, 5.367, 6684.748, 736, 5.092, 398.149, 727, 5.538, 6283.076, 631, 0.730, 5884.927, 623, 4.851, 2942.463, 601, 3.680, 796.298, 472, 4.522, 3149.164, 470, 5.135, 3340.680, 470, 5.543, 3340.545, 466, 5.474, 20043.675, 456, 2.133, 2810.921, 413, 0.200, 9492.146, 385, 4.080, 4136.910, 331, 4.066, 1751.540, 327, 2.621, 2914.014, 297, 5.922, 3532.061, 295, 2.753, 12303.068, 286, 4.947, 3870.303, 282, 2.063, 5486.778, 266, 3.551, 6681.242, 266, 1.520, 6681.208, 261, 2.601, 4399.994, 233, 2.276, 1589.073, 226, 2.275, 1194.447, 199, 2.674, 8432.764, 189, 6.044, 7079.374,
/*B1*/  3500688, 5.3684784, 3340.6124267, 141160, 3.141593, 0.000000, 96708, 5.47878, 6681.22485, 14719, 3.20206, 10021.83728, 4259, 3.4084, 13362.4497, 1020, 0.7762, 3337.0893, 788, 3.718, 16703.062, 327, 3.458, 5621.843, 262, 2.483, 2281.230, 207, 1.441, 6151.534, 183, 6.031, 529.691, 170, 4.811, 3344.136, 157, 3.931, 8962.455, 156, 2.782, 3340.595, 156, 4.813, 3340.630, 143, 0.246, 2942.463, 138, 1.680, 3532.061, 131, 0.973, 6677.702, 127, 4.045, 20043.675, 125, 2.256, 5884.927, 93, 4.35, 3496.03, 89, 5.95, 2810.92, 88, 0.34, 398.15, 86, 1.75, 2544.31, 81, 0.84, 6283.08, 81, 4.30, 6684.75, 59, 3.70, 5486.78, 58, 3.55, 5092.15,
/*B2*/  167267, 0.602214, 3340.612427, 49868, 3.14159, 0.00000, 3021, 5.5587, 6681.2249, 258, 1.897, 13362.450, 215, 0.917, 10021.837, 118, 2.242, 3337.089, 80, 2.25, 16703.06, 30, 5.89, 3496.03,
/*B3*/  6065, 1.9805, 3340.6124, 426, 0.000, 0.000, 137, 1.796, 6681.225, 27, 3.45, 10021.84, 9, 3.75, 3337.09,
/*B4*/  134, 0.000, 0.000, 113, 3.457, 3340.612, 7, 0.50, 6681.22,
/*B5*/  5, 4.87, 3340.61, 1, 5.31, 6681.22,
/*R0*/  1530334883, 0.0000000000, 0.0000000000, 141849532, 3.479712835, 3340.612426700, 6607764, 3.8178344, 6681.2248534, 461791, 4.155953, 10021.837280, 81097, 5.55958, 2810.92146, 74853, 1.77239, 5621.84292, 55232, 1.36436, 2281.23050, 38252, 4.49407, 13362.44971, 24844, 4.92546, 2942.46342, 23065, 0.09082, 2544.31442, 19994, 5.36060, 3337.08931, 19602, 4.74249, 3344.13555, 11671, 2.11262, 5092.15196, 11028, 5.00908, 398.14900, 9923, 5.8386, 6151.5339, 8991, 4.4079, 529.6910, 8073, 2.1022, 1059.3819, 7979, 3.4484, 796.2980, 7410, 1.4991, 2146.1654, 7256, 1.2452, 8432.7644, 6923, 2.1338, 8962.4553, 6331, 0.8935, 3340.5952, 6331, 2.9243, 3340.6297, 6300, 1.2874, 1751.5395, 5744, 0.8290, 2914.0142, 5262, 5.3829, 3738.7614, 4728, 5.1985, 3127.3133, 3481, 4.8322, 16703.0621, 2837, 2.9069, 3532.0607, 2796, 5.2575, 6283.0758, 2755, 1.2177, 6254.6267, 2752, 2.9082, 1748.0164, 2699, 3.7639, 5884.9268, 2391, 2.0367, 1194.4470, 2338, 5.1055, 5486.7778, 2281, 3.2553, 6872.6731, 2232, 4.1986, 3149.1642, 2194, 5.5834, 191.4483, 2083, 4.8463, 3340.6797, 2083, 5.2548, 3340.5451, 1862, 5.6987, 6677.7017, 1827, 5.0806, 6684.7480, 1786, 4.1842, 3333.4989, 1760, 5.9534, 3870.3034, 1635, 3.7989, 4136.9104, 1443, 0.2130, 5088.6288, 1418, 2.4779, 4562.4610, 1331, 1.5391, 7903.0734, 1286, 5.4988, 8827.3903, 1188, 2.1218, 1589.0729, 1149, 4.3175, 1349.8674, 1115, 0.5534, 11243.6858, 1021, 6.1814, 9492.1463, 867, 1.750, 2700.715, 853, 1.616, 4690.480, 845, 0.623, 1592.596, 832, 0.616, 8429.241, 825, 1.622, 11773.377, 718, 2.475, 12303.068, 686, 2.402, 4399.994, 665, 2.213, 6041.328, 636, 2.673, 426.598, 620, 1.101, 1221.849, 590, 3.262, 6681.242, 590, 1.232, 6681.208, 586, 4.721, 213.299, 558, 1.233, 3185.192, 557, 5.447, 3723.509, 550, 5.727, 951.718, 524, 3.024, 4292.331, 516, 5.723, 7079.374, 489, 5.616, 3553.912, 454, 5.433, 6467.926, 446, 2.015, 8031.092, 443, 5.003, 5614.729, 433, 1.037, 11769.854, 424, 2.266, 155.420, 422, 1.633, 5628.956, 392, 1.242, 3339.632, 390, 2.578, 3341.593, 364, 4.439, 3894.182, 360, 1.160, 2288.344, 353, 5.490, 1990.745, 336, 5.170, 20043.675, 331, 0.855, 553.569, 323, 2.382, 4535.059, 320, 1.940, 382.897, 319, 4.593, 2274.117, 319, 4.375, 3.523, 303, 2.442, 11371.705, 294, 4.060, 3097.884, 279, 4.258, 3191.049, 275, 1.577, 9595.239, 262, 5.585, 9623.688, 252, 0.814, 10713.995, 248, 5.390, 2818.035, 247, 2.580, 2803.808, 234, 6.015, 3496.033, 228, 3.417, 7632.943, 221, 0.857, 3319.837, 213, 6.192, 14054.607, 210, 2.385, 4989.059, 206, 2.987, 3361.388, 204, 4.536, 6489.777, 199, 2.735, 5099.266, 197, 1.863, 3443.705, 195, 6.038, 10018.314, 194, 5.185, 6681.292, 194, 5.594, 6681.158, 191, 5.420, 10025.360, 191, 0.226, 13745.346, 186, 4.073, 2388.894, 183, 5.796, 7064.121, 182, 5.613, 7.114, 180, 2.814, 4032.770, 172, 3.671, 3205.547, 172, 3.188, 3347.726, 171, 1.550, 2957.716, 170, 6.155, 10404.734, 167, 4.521, 6674.111, 165, 4.141, 7477.523, 165, 3.845, 10973.556, 165, 2.866, 14712.317, 163, 6.282, 7210.916, 163, 1.923, 7373.382, 161, 0.928, 14584.298, 160, 4.584, 3264.346, 154, 2.208, 2118.764, 151, 2.654, 2787.043, 137, 1.686, 3337.022, 134, 2.128, 3344.203, 131, 4.275, 14314.168, 119, 0.799, 3265.831, 119, 4.821, 7234.794, 118, 0.197, 3475.678, 118, 3.229, 5828.028, 112, 0.239, 12832.759, 110, 0.445, 10213.286, 106, 1.740, 639.897, 102, 5.748, 242.729, 102, 2.665, 2487.416, 101, 5.375, 5085.038, 101, 0.789, 9381.940, 101, 2.451, 4929.685, 90, 0.96, 4933.21, 90, 1.99, 15113.99, 90, 4.18, 9225.54, 83, 1.94, 1648.45, 83, 0.95, 2906.90, 82, 5.25, 10575.41, 80, 3.92, 2921.13, 79, 2.81, 15643.68, 78, 2.05, 1758.65, 75, 5.68, 13916.02, 74, 6.10, 3583.34, 74, 0.84, 692.16, 70, 3.32, 3230.41, 68, 4.69, 17654.78, 65, 6.12, 135.07, 65, 2.74, 7740.61, 64, 4.20, 5202.36, 63, 3.32, 3767.21, 63, 4.50, 8425.65, 62, 6.11, 17256.63, 62, 4.48, 22747.29, 62, 4.59, 6531.66, 62, 1.57, 10021.82, 62, 3.60, 10021.85, 61, 0.00, 6836.65, 57, 0.14, 13524.92, 55, 5.75, 12168.00, 55, 6.06, 10419.99, 54, 5.22, 5305.45, 54, 5.08, 2707.83, 53, 4.55, 1744.43, 52, 2.70, 4459.37, 51, 1.57, 6525.80, 51, 1.29, 8439.88, 50, 2.34, 1052.27, 50, 4.68, 522.58, 47, 0.01, 3325.36, 47, 5.78, 9808.54, 47, 3.06, 5518.75, 47, 5.15, 1066.50, 45, 1.44, 3369.06, 45, 5.95, 6894.52, 44, 5.57, 16865.53, 44, 0.82, 3302.48, 43, 3.11, 4569.57, 43, 2.79, 3503.08, 42, 1.91, 263.08, 41, 4.40, 3074.01, 41, 5.49, 2699.73, 41, 5.47, 3120.20, 40, 1.34, 6247.51, 40, 1.84, 3134.43, 40, 3.83, 3355.86, 39, 1.98, 8969.57, 39, 1.49, 9168.64, 39, 0.38, 10177.26, 39, 1.23, 16858.48, 39, 3.48, 20618.02, 38, 0.80, 13517.87, 38, 0.27, 17395.22, 37, 4.25, 6261.74, 37, 1.58, 6680.24, 36, 2.95, 6144.42, 36, 5.55, 632.78, 36, 2.92, 6682.21, 36, 3.68, 5724.94, 36, 0.15, 2178.14, 35, 1.18, 10184.30,
/*R1*/  11074333, 2.03250525, 3340.61242670, 1031759, 2.3707185, 6681.2248534, 128772, 0.000000, 0.000000, 108159, 2.708881, 10021.837280, 11946, 3.04702, 13362.44971, 4386, 2.8884, 2281.2305, 3957, 3.4232, 3344.1355, 1826, 1.5843, 2544.3144, 1359, 3.3851, 16703.0621, 1284, 6.0434, 3337.0893, 1282, 0.6299, 1059.3819, 1271, 1.9539, 796.2980, 1184, 2.9976, 2146.1654, 875, 3.421, 398.149, 830, 3.856, 3738.761, 756, 4.451, 6151.534, 720, 2.764, 529.691, 665, 2.549, 1751.540, 664, 4.406, 1748.016, 575, 0.544, 1194.447, 543, 0.678, 8962.455, 510, 3.726, 6684.748, 494, 5.730, 3340.595, 494, 1.477, 3340.630, 483, 2.581, 3149.164, 479, 2.285, 2914.014, 390, 2.319, 4136.910, 372, 5.814, 1349.867, 364, 6.027, 3185.192, 360, 5.895, 3333.499, 311, 0.978, 191.448, 272, 5.414, 1592.596, 243, 3.758, 155.420, 228, 1.748, 5088.629, 223, 0.939, 951.718, 217, 3.836, 6283.076, 216, 4.569, 3532.061, 213, 0.780, 1589.073, 204, 3.135, 4690.480, 182, 0.413, 5486.778, 180, 4.219, 3870.303, 169, 4.537, 4292.331, 168, 5.549, 3097.884, 165, 0.968, 4399.994, 165, 3.539, 2700.715, 163, 3.808, 3340.545, 163, 3.399, 3340.680, 162, 2.349, 553.569, 158, 4.757, 9492.146, 157, 3.724, 20043.675, 147, 5.953, 3894.182, 143, 3.999, 1990.745, 132, 0.415, 5614.729, 130, 5.142, 6677.702, 127, 0.690, 3723.509, 125, 1.032, 3341.593, 124, 6.231, 5628.956, 122, 4.223, 7079.374, 118, 6.253, 2274.117, 113, 1.024, 12303.068, 112, 1.318, 3496.033, 104, 1.233, 426.598, 103, 0.901, 4535.059, 98, 3.45, 382.90, 92, 1.82, 6681.24, 92, 6.07, 6681.21, 92, 3.90, 3553.91, 90, 2.58, 2388.89, 88, 2.20, 1221.85, 86, 1.16, 2787.04, 79, 5.74, 2288.34, 78, 4.15, 6041.33, 77, 1.01, 8432.76, 73, 4.27, 2803.81, 72, 3.70, 2818.04, 71, 3.51, 8031.09, 68, 4.05, 10025.36, 68, 0.24, 11773.38, 67, 4.26, 242.73, 65, 0.04, 2957.72, 65, 2.12, 8429.24, 65, 2.76, 3339.63, 63, 1.90, 5621.84, 63, 1.60, 3347.73, 60, 2.96, 6489.78, 57, 3.14, 213.30, 55, 4.91, 7632.94, 55, 4.61, 3583.34, 53, 3.78, 5092.15, 52, 2.67, 7477.52, 51, 3.98, 7.11, 47, 0.91, 5099.27, 46, 1.82, 2810.92, 40, 4.14, 9623.69, 40, 4.91, 2942.46, 39, 0.54, 5884.93, 39, 3.08, 3.52, 39, 0.67, 3127.31, 38, 0.03, 7234.79, 37, 0.09, 6525.80, 36, 5.77, 4933.21, 32, 4.55, 2487.42, 31, 1.00, 2118.76, 30, 2.59, 2906.90, 30, 4.15, 6681.16, 30, 3.74, 6681.29, 30, 0.83, 5085.04, 29, 4.66, 7210.92, 28, 1.01, 7064.12, 28, 0.05, 639.90, 28, 3.98, 6467.93, 28, 5.17, 5828.03, 27, 0.69, 2699.73, 26, 5.34, 10973.56, 26, 5.01, 10018.31, 26, 1.09, 4929.69, 26, 5.09, 12832.76, 25, 1.53, 6836.65, 24, 3.94, 11371.70, 22, 0.19, 9595.24, 21, 5.69, 3191.05, 21, 1.30, 7740.61, 21, 3.54, 1066.50, 21, 6.24, 6674.11, 20, 6.16, 1744.43, 20, 0.46, 10575.41, 19, 5.02, 3475.68, 19, 1.37, 15643.68, 18, 4.06, 23384.29, 18, 6.16, 8425.65, 18, 5.68, 3319.84, 18, 2.31, 3355.86, 18, 5.87, 3320.26, 17, 4.58, 10419.99, 17, 2.22, 2921.13, 17, 1.93, 3767.21, 16, 4.34, 5331.36, 16, 5.93, 8439.88, 15, 1.54, 3361.39, 15, 0.35, 8969.57, 14, 2.15, 10021.85, 14, 0.12, 10021.82, 14, 0.56, 15113.99, 14, 1.39, 6682.21, 14, 4.65, 4562.46, 14, 1.50, 3325.36, 14, 0.15, 1758.65, 13, 1.25, 7875.67, 13, 1.87, 692.16, 13, 1.45, 6254.63, 13, 5.79, 14584.30, 13, 1.35, 10404.73, 12, 6.03, 3264.35, 12, 1.88, 10177.26, 12, 0.85, 3120.20, 12, 4.30, 6894.52, 12, 0.90, 13916.02, 12, 4.18, 3360.97, 12, 3.00, 6247.51, 11, 0.15, 3134.43, 11, 2.84, 640.88, 11, 2.58, 6261.74, 11, 0.49, 11243.69, 11, 0.25, 3337.02, 11, 0.13, 522.58, 11, 0.68, 3344.20, 10, 4.06, 6158.65, 10, 5.70, 536.80, 10, 5.77, 14314.17, 10, 1.28, 4569.57, 10, 2.92, 5729.51,
/*R2*/  442422, 0.479306, 3340.612427, 81380, 0.86998, 6681.22485, 12749, 1.22594, 10021.83728, 1874, 1.5730, 13362.4497, 524, 3.142, 0.000, 407, 1.971, 3344.136, 266, 1.917, 16703.062, 178, 4.435, 2281.230, 117, 4.525, 3185.192, 102, 5.391, 1059.382, 100, 0.419, 796.298, 92, 4.54, 2146.17, 78, 5.93, 1748.02, 73, 3.14, 2544.31, 72, 2.29, 6684.75, 68, 5.27, 155.42, 67, 5.30, 1194.45, 65, 2.31, 3738.76, 58, 1.05, 1349.87, 54, 1.00, 3149.16, 47, 0.77, 3097.88, 46, 0.81, 4136.91, 44, 2.46, 951.72, 43, 3.90, 1592.60, 39, 3.86, 553.57, 37, 2.26, 20043.67, 36, 1.32, 3333.50, 35, 1.85, 398.15, 34, 3.82, 1751.54, 32, 2.12, 5614.73, 31, 4.55, 5628.96, 30, 2.86, 6151.53, 29, 1.19, 529.69, 29, 1.20, 3894.18, 28, 2.49, 1990.75, 27, 2.92, 3496.03, 27, 6.07, 4292.33, 24, 4.68, 4690.48, 24, 5.94, 2787.04, 23, 2.56, 191.45, 22, 1.85, 3337.09, 22, 5.37, 8962.46, 22, 1.07, 2388.89, 21, 2.75, 242.73, 20, 3.82, 2914.01, 20, 5.76, 3341.59, 20, 5.76, 4399.99, 20, 4.17, 3340.60, 20, 6.21, 3340.63, 20, 3.11, 3583.34, 18, 5.69, 1589.07, 18, 3.32, 5088.63, 16, 5.68, 4535.06, 15, 4.96, 382.90, 15, 2.23, 3723.51, 14, 2.70, 7079.37, 14, 5.19, 2700.72, 13, 4.88, 6525.80, 13, 4.82, 2957.72, 12, 2.62, 10025.36, 12, 0.93, 2810.92, 12, 3.27, 9492.15, 10, 6.27, 3347.73, 10, 3.40, 5621.84, 10, 2.11, 3870.30, 9, 1.40, 6489.78, 9, 5.81, 12303.07, 9, 2.20, 2699.73, 9, 5.96, 426.60, 8, 2.26, 6283.08, 8, 2.24, 3553.91, 8, 1.17, 7477.52, 8, 2.01, 5092.15, 8, 0.23, 3532.06, 8, 2.06, 5486.78, 7, 4.26, 4933.21, 7, 0.30, 6681.24, 7, 4.55, 6681.21, 7, 2.34, 7.11, 7, 3.99, 6677.70, 7, 0.16, 7632.94, 6, 2.25, 3340.55, 6, 1.84, 3340.68, 6, 1.55, 7234.79, 6, 3.30, 1221.85, 6, 5.06, 8031.09, 5, 4.26, 3339.63, 5, 2.60, 23384.29, 5, 3.08, 6836.65, 4, 1.34, 640.88, 4, 4.96, 8969.57, 4, 2.85, 5331.36, 4, 6.27, 2487.42, 4, 6.10, 7740.61,
/*R3*/  11131, 5.14987, 3340.61243, 4244, 5.6134, 6681.2249, 1000, 5.9973, 10021.8373, 196, 0.076, 13362.450, 47, 3.14, 0.00, 35, 0.43, 16703.06, 29, 0.45, 3344.14, 24, 3.02, 3185.19, 7, 0.81, 6684.75, 6, 0.78, 20043.67, 5, 3.87, 1059.38, 5, 1.61, 3583.34, 5, 4.52, 3496.03, 4, 5.72, 3149.16, 4, 4.42, 2787.04, 4, 5.56, 4136.91, 3, 3.38, 6525.80, 3, 0.76, 3738.76, 2, 2.14, 3097.88, 2, 5.83, 2388.89, 2, 0.57, 155.42, 2, 4.20, 3341.59, 2, 0.97, 1990.75, 2, 2.35, 1592.60, 2, 4.15, 4535.06, 2, 3.76, 1194.45, 2, 1.14, 10025.36, 2, 5.13, 796.30,
/*R4*/  196, 3.582, 3340.612, 163, 4.051, 6681.225, 58, 4.46, 10021.84, 15, 4.84, 13362.45, 4, 1.51, 3185.19, 3, 5.21, 16703.06, 2, 5.16, 3344.14, 1, 0.00, 0.00, 1, 2.19, 3496.03, 1, 0.10, 3583.34, 1, 5.55, 20043.67, 1, 1.87, 6525.80,
/*R5*/  5, 2.48, 6681.22, 3, 2.92, 10021.84, 1, 1.77, 3340.61, 1, 3.31, 13362.45),

  //Djup精度:J2000+-4千年 黄经0.5角秒 黄纬0.5角秒 距离3AU/10^6
  new Array(
    100000000,//A的倍率
    20, 503, 863, 1256, 1451, 1529, 1550, 1676, 1802, 1910, 1964, 1988, 1991, 2513, 2945, 3482, 3761, 3896, 3923,//位置索引表
/*L0*/  59954691, 0.00000000, 0.00000000, 9695899, 5.0619179, 529.6909651, 573610, 1.444062, 7.113547, 306389, 5.417347, 1059.381930, 97178, 4.14265, 632.78374, 72903, 3.64043, 522.57742, 64264, 3.41145, 103.09277, 39806, 2.29377, 419.48464, 38858, 1.27232, 316.39187, 27965, 1.78455, 536.80451, 13590, 5.77481, 1589.07290, 8769, 3.6300, 949.1756, 8246, 3.5823, 206.1855, 7368, 5.0810, 735.8765, 6263, 0.0250, 213.2991, 6114, 4.5132, 1162.4747, 5305, 4.1863, 1052.2684, 5305, 1.3067, 14.2271, 4905, 1.3208, 110.2063, 4647, 4.6996, 3.9322, 3045, 4.3168, 426.5982, 2610, 1.5667, 846.0828, 2028, 1.0638, 3.1814, 1921, 0.9717, 639.8973, 1765, 2.1415, 1066.4955, 1723, 3.8804, 1265.5675, 1633, 3.5820, 515.4639, 1432, 4.2968, 625.6702, 973, 4.098, 95.979, 884, 2.437, 412.371, 733, 6.085, 838.969, 731, 3.806, 1581.959, 709, 1.293, 742.990, 692, 6.134, 2118.764, 614, 4.109, 1478.867, 582, 4.540, 309.278, 495, 3.756, 323.505, 441, 2.958, 454.909, 417, 1.036, 2.448, 390, 4.897, 1692.166, 376, 4.703, 1368.660, 341, 5.715, 533.623, 330, 4.740, 0.048, 262, 1.877, 0.963, 261, 0.820, 380.128, 257, 3.724, 199.072, 244, 5.220, 728.763, 235, 1.227, 909.819, 220, 1.651, 543.918, 207, 1.855, 525.759, 202, 1.807, 1375.774, 197, 5.293, 1155.361, 175, 3.730, 942.062, 175, 3.226, 1898.351, 175, 5.910, 956.289, 158, 4.365, 1795.258, 151, 3.906, 74.782, 149, 4.377, 1685.052, 141, 3.136, 491.558, 138, 1.318, 1169.588, 131, 4.169, 1045.155, 117, 2.500, 1596.186, 117, 3.389, 0.521, 106, 4.554, 526.510, 100, 1.421, 532.872, 96, 1.18, 117.32, 92, 0.86, 1272.68, 88, 1.22, 453.42, 77, 4.43, 39.36, 72, 4.24, 2111.65, 70, 5.14, 835.04, 69, 2.35, 2.92, 67, 2.99, 2214.74, 66, 5.34, 1471.75, 63, 4.98, 0.75, 62, 0.51, 220.41, 60, 4.13, 4.19, 59, 4.11, 2001.44, 58, 5.87, 5753.38, 56, 1.15, 21.34, 54, 1.57, 983.12, 53, 0.91, 10.29, 52, 4.10, 1258.45, 47, 3.55, 5.42, 47, 4.79, 305.35, 46, 4.67, 5.63, 46, 5.11, 4.67, 43, 0.15, 528.21, 42, 4.68, 302.16, 40, 4.69, 0.16, 39, 4.25, 853.20, 39, 1.72, 11.05, 39, 6.08, 518.65, 38, 2.44, 433.71, 38, 0.21, 2648.45, 38, 6.19, 831.86, 36, 2.45, 430.53, 36, 4.61, 2008.56, 34, 1.01, 9683.59, 33, 5.29, 88.87, 32, 5.14, 1788.14, 31, 0.42, 1.48, 30, 3.67, 508.35, 30, 5.34, 2221.86, 28, 1.85, 0.21, 27, 2.81, 18.16, 27, 1.78, 532.14, 26, 2.74, 2531.13, 26, 3.86, 2317.84, 25, 2.63, 114.14, 24, 3.82, 1574.85, 24, 2.53, 494.27, 23, 3.24, 984.60, 23, 3.85, 2428.04, 22, 6.02, 1063.31, 21, 1.29, 35.42, 21, 4.03, 355.75, 20, 1.02, 628.85, 20, 5.60, 527.24, 19, 0.52, 14.98, 19, 4.86, 1361.55, 18, 4.30, 6.15, 17, 1.59, 1439.51, 16, 2.77, 760.26, 16, 5.27, 142.45, 16, 1.89, 529.64, 16, 5.09, 529.74, 16, 4.12, 636.72, 15, 6.08, 149.56, 15, 2.82, 621.74, 15, 4.86, 2104.54, 15, 0.88, 99.16, 15, 6.26, 569.05, 14, 2.41, 530.65, 14, 2.72, 0.26, 14, 3.56, 217.23, 13, 2.19, 1055.45, 13, 2.72, 1364.73, 13, 4.76, 528.73, 13, 1.39, 7.07, 12, 2.61, 405.26, 12, 4.30, 604.47, 12, 0.25, 1485.98, 12, 3.60, 2634.23, 12, 4.60, 7.16, 12, 2.35, 643.83, 11, 2.01, 1073.61, 11, 2.48, 423.42, 11, 4.05, 519.40, 11, 5.04, 458.84, 11, 5.09, 2324.95, 11, 2.51, 2847.53, 11, 2.08, 92.05, 11, 3.12, 1.27, 10, 3.63, 2744.43, 10, 2.09, 511.53, 10, 1.31, 1905.46, 10, 3.66, 107.02, 10, 4.06, 38.13, 10, 1.70, 1699.28, 10, 1.22, 32.24,
/*L1*/  52993480757, 0.00000000000, 0.00000000000, 489741, 4.220667, 529.690965, 228919, 6.026475, 7.113547, 27655, 4.57266, 1059.38193, 20721, 5.45939, 522.57742, 12106, 0.16986, 536.80451, 6068, 4.4242, 103.0928, 5434, 3.9848, 419.4846, 4238, 5.8901, 14.2271, 2212, 5.2677, 206.1855, 1746, 4.9267, 1589.0729, 1296, 5.5513, 3.1814, 1173, 5.8565, 1052.2684, 1163, 0.5145, 3.9322, 1099, 5.3070, 515.4639, 1007, 0.4648, 735.8765, 1004, 3.1504, 426.5982, 848, 5.758, 110.206, 827, 4.803, 213.299, 816, 0.586, 1066.495, 725, 5.518, 639.897, 568, 5.989, 625.670, 474, 4.132, 412.371, 413, 5.737, 95.979, 345, 4.242, 632.784, 336, 3.732, 1162.475, 234, 4.035, 949.176, 234, 6.243, 309.278, 199, 1.505, 838.969, 195, 2.219, 323.505, 187, 6.086, 742.990, 184, 6.280, 543.918, 171, 5.417, 199.072, 131, 0.626, 728.763, 115, 0.680, 846.083, 115, 5.286, 2118.764, 108, 4.493, 956.289, 80, 5.82, 1045.15, 72, 5.34, 942.06, 70, 5.97, 532.87, 67, 5.73, 21.34, 66, 0.13, 526.51, 65, 6.09, 1581.96, 59, 0.59, 1155.36, 58, 0.99, 1596.19, 57, 5.97, 1169.59, 57, 1.41, 533.62, 55, 5.43, 10.29, 52, 5.73, 117.32, 52, 0.23, 1368.66, 50, 6.08, 525.76, 47, 3.63, 1478.87, 47, 0.51, 1265.57, 40, 4.16, 1692.17, 34, 0.10, 302.16, 33, 5.04, 220.41, 32, 5.37, 508.35, 29, 5.42, 1272.68, 29, 3.36, 4.67, 29, 0.76, 88.87, 25, 1.61, 831.86, 22, 6.15, 1685.05, 21, 5.86, 1258.45, 20, 2.17, 316.39, 18, 0.83, 433.71, 18, 5.96, 5.42, 18, 0.50, 1375.77, 17, 0.71, 1471.75, 17, 2.76, 853.20, 14, 0.91, 18.16, 14, 0.63, 2.92, 12, 1.76, 380.13, 12, 4.30, 405.26, 11, 5.57, 1574.85, 10, 0.31, 1361.55, 10, 0.39, 1073.61, 10, 5.90, 519.40, 9, 3.22, 1795.26, 9, 0.54, 1788.14, 8, 5.88, 2001.44, 8, 5.10, 1485.98, 8, 5.65, 2648.45, 7, 6.19, 11.05, 7, 2.41, 4.19, 6, 1.36, 1148.25, 6, 4.22, 2008.56, 6, 5.57, 191.96, 5, 4.40, 2221.86, 5, 1.46, 330.62, 5, 5.23, 628.85, 5, 2.93, 518.65, 5, 0.17, 629.60, 5, 0.79, 721.65, 5, 6.25, 1677.94, 5, 4.95, 635.97, 5, 2.07, 453.42, 4, 0.09, 1062.56, 4, 4.36, 423.42, 4, 0.15, 1699.28, 4, 4.14, 511.53, 4, 0.24, 2104.54, 4, 1.44, 2125.88, 4, 0.50, 1056.20, 4, 6.19, 636.72, 4, 2.55, 74.78, 4, 2.93, 32.24, 4, 5.67, 2317.84, 4, 0.25, 1055.45, 3, 5.89, 1802.37, 3, 4.61, 416.30, 3, 5.50, 107.02, 3, 1.09, 1464.64, 3, 5.73, 99.91, 3, 3.31, 0.75, 3, 1.61, 1063.31, 3, 1.25, 540.74, 3, 3.04, 422.67, 3, 4.29, 106.27, 3, 0.35, 1898.35, 3, 3.60, 750.10,
/*L2*/  47234, 4.32148, 7.11355, 38966, 0.00000, 0.00000, 30629, 2.93021, 529.69097, 3189, 1.0550, 522.5774, 2729, 4.8455, 536.8045, 2723, 3.4141, 1059.3819, 1721, 4.1873, 14.2271, 383, 5.768, 419.485, 378, 0.760, 515.464, 367, 6.055, 103.093, 337, 3.786, 3.181, 308, 0.694, 206.186, 218, 3.814, 1589.073, 199, 5.340, 1066.495, 197, 2.484, 3.932, 156, 1.406, 1052.268, 146, 3.814, 639.897, 142, 1.634, 426.598, 130, 5.837, 412.371, 117, 1.414, 625.670, 97, 4.03, 110.21, 91, 1.11, 95.98, 87, 2.52, 632.78, 79, 4.64, 543.92, 72, 2.22, 735.88, 58, 0.83, 199.07, 57, 3.12, 213.30, 49, 1.67, 309.28, 40, 4.02, 21.34, 40, 0.62, 323.51, 36, 2.33, 728.76, 29, 3.61, 10.29, 28, 3.24, 838.97, 26, 4.50, 742.99, 26, 2.51, 1162.47, 25, 1.22, 1045.15, 24, 3.01, 956.29, 19, 4.29, 532.87, 18, 0.81, 508.35, 17, 4.20, 2118.76, 17, 1.83, 526.51, 15, 5.81, 1596.19, 15, 0.68, 942.06, 15, 4.00, 117.32, 14, 5.95, 316.39, 14, 1.80, 302.16, 13, 2.52, 88.87, 13, 4.37, 1169.59, 11, 4.44, 525.76, 10, 1.72, 1581.96, 9, 2.18, 1155.36, 9, 3.29, 220.41, 9, 3.32, 831.86, 8, 5.76, 846.08, 8, 2.71, 533.62, 7, 2.18, 1265.57, 6, 0.50, 949.18, 5, 6.01, 405.26, 5, 3.65, 1272.68, 5, 1.41, 1258.45, 4, 3.02, 1692.17, 4, 5.48, 433.71, 4, 2.27, 1368.66, 4, 5.07, 1073.61, 4, 5.29, 18.16, 4, 1.27, 853.20, 3, 1.54, 519.40, 3, 0.99, 191.96, 3, 2.05, 1361.55, 3, 2.10, 1478.87, 3, 1.06, 1574.85, 2, 2.37, 1471.75, 2, 3.03, 1148.25, 2, 2.48, 721.65, 2, 3.71, 1485.98, 2, 6.17, 330.62, 2, 1.88, 1685.05, 1, 5.15, 1375.77, 1, 4.72, 32.24, 1, 3.19, 635.97, 1, 1.99, 629.60, 1, 4.27, 551.03, 1, 1.28, 1038.04, 1, 4.02, 539.99, 1, 4.76, 1062.56, 1, 4.63, 2648.45, 1, 2.26, 1788.14, 1, 0.03, 2125.88, 1, 1.70, 1677.94, 1, 2.18, 1795.26, 1, 2.98, 81.75, 1, 5.06, 1699.28, 1, 0.14, 416.30, 1, 1.99, 295.05, 1, 3.75, 28.45, 1, 1.91, 750.10, 1, 2.81, 1464.64, 1, 3.01, 124.43, 1, 1.18, 99.91, 1, 3.53, 227.53, 1, 1.75, 1898.35, 1, 2.07, 1056.20, 1, 2.74, 618.56, 1, 6.25, 423.42, 1, 2.00, 2111.65, 1, 1.65, 2001.44, 1, 4.92, 1055.45, 1, 2.89, 2008.56, 1, 4.32, 1802.37, 1, 1.26, 1382.89, 1, 3.03, 2221.86, 1, 2.65, 106.27, 1, 3.30, 628.85, 1, 3.44, 824.74, 1, 0.08, 963.40, 1, 3.12, 5746.27, 1, 5.47, 5760.50, 1, 1.88, 2104.54, 1, 1.20, 422.67, 1, 4.68, 611.44, 1, 1.86, 636.72, 1, 4.54, 9676.48, 1, 0.61, 9690.71, 1, 2.84, 1905.46, 1, 3.08, 380.13, 1, 0.84, 1891.24, 1, 3.96, 440.83, 1, 1.56, 1994.33, 1, 2.55, 1781.03, 1, 1.11, 107.02, 1, 4.44, 647.01,
/*L3*/  6502, 2.5986, 7.1135, 1357, 1.3464, 529.6910, 471, 2.475, 14.227, 417, 3.245, 536.805, 353, 2.974, 522.577, 155, 2.076, 1059.382, 87, 2.51, 515.46, 44, 0.00, 0.00, 34, 3.83, 1066.50, 28, 2.45, 206.19, 24, 1.28, 412.37, 23, 2.98, 543.92, 20, 2.10, 639.90, 20, 1.40, 419.48, 19, 1.59, 103.09, 17, 2.30, 21.34, 17, 2.60, 1589.07, 16, 3.15, 625.67, 16, 3.36, 1052.27, 13, 2.76, 95.98, 13, 2.54, 199.07, 13, 6.27, 426.60, 9, 1.76, 10.29, 9, 2.27, 110.21, 7, 3.43, 309.28, 7, 4.04, 728.76, 6, 2.52, 508.35, 5, 2.91, 1045.15, 5, 5.25, 323.51, 4, 4.30, 88.87, 4, 3.52, 302.16, 4, 4.09, 735.88, 3, 1.43, 956.29, 3, 4.36, 1596.19, 3, 1.25, 213.30, 3, 5.02, 838.97, 3, 2.24, 117.32, 2, 2.90, 742.99, 2, 2.36, 942.06, 2, 2.77, 1169.59, 2, 5.01, 831.86, 2, 1.40, 405.26, 1, 1.61, 220.41, 1, 3.09, 2118.76, 1, 3.98, 1155.36, 1, 3.46, 1073.61, 1, 3.39, 532.87, 1, 2.70, 191.96, 1, 1.48, 632.78, 1, 3.30, 1258.45, 1, 1.11, 1162.47, 1, 3.66, 1581.96, 1, 3.75, 433.71, 1, 5.90, 853.20, 1, 1.96, 1272.68, 1, 2.93, 1574.85, 1, 3.53, 525.76, 1, 2.02, 526.51, 1, 4.15, 721.65, 1, 4.69, 81.75, 1, 2.28, 551.03, 1, 4.36, 1368.66, 1, 1.57, 949.18, 1, 4.96, 1148.25, 1, 4.31, 330.62,
/*L4*/  669, 0.853, 7.114, 114, 3.142, 0.000, 100, 0.743, 14.227, 50, 1.65, 536.80, 44, 5.82, 529.69, 32, 4.86, 522.58, 15, 4.29, 515.46, 9, 0.71, 1059.38, 5, 1.30, 543.92, 4, 2.32, 1066.50, 4, 0.48, 21.34, 3, 3.00, 412.37, 2, 0.40, 639.90, 2, 4.26, 199.07, 2, 4.91, 625.67, 2, 4.26, 206.19, 1, 5.26, 1052.27, 1, 4.72, 95.98, 1, 1.29, 1589.07, 1, 4.78, 1045.15, 1, 6.06, 88.87, 1, 5.78, 728.76, 1, 4.55, 426.60, 1, 3.40, 419.48, 1, 3.55, 103.09, 1, 0.52, 110.21,
/*L5*/  50, 5.26, 7.11, 16, 5.25, 14.23, 4, 0.01, 536.80, 2, 1.10, 522.58, 1, 3.14, 0.00, 1, 5.86, 543.92, 1, 0.87, 515.46,
/*B0*/  2268616, 3.5585261, 529.6909651, 110090, 0.000000, 0.000000, 109972, 3.908093, 1059.381930, 8101, 3.6051, 522.5774, 6438, 0.3063, 536.8045, 6044, 4.2588, 1589.0729, 1107, 2.9853, 1162.4747, 944, 1.675, 426.598, 942, 2.936, 1052.268, 894, 1.754, 7.114, 836, 5.179, 103.093, 767, 2.155, 632.784, 684, 3.678, 213.299, 629, 0.643, 1066.495, 559, 0.014, 846.083, 532, 2.703, 110.206, 464, 1.173, 949.176, 431, 2.608, 419.485, 351, 4.611, 2118.764, 132, 4.778, 742.990, 123, 3.350, 1692.166, 116, 1.387, 323.505, 115, 5.049, 316.392, 104, 3.701, 515.464, 103, 2.319, 1478.867, 102, 3.153, 1581.959, 79, 3.98, 1265.57, 70, 2.56, 956.29, 63, 4.50, 735.88, 56, 0.38, 1375.77, 55, 0.40, 525.76, 52, 0.99, 1596.19, 50, 0.19, 543.92, 49, 3.57, 533.62, 29, 5.43, 206.19, 28, 1.54, 625.67, 24, 6.11, 1169.59, 23, 5.95, 838.97, 23, 4.06, 526.51, 23, 6.19, 532.87, 21, 2.69, 1045.15, 21, 4.96, 2648.45,
/*B1*/  177352, 5.701665, 529.690965, 3230, 5.7794, 1059.3819, 3081, 5.4746, 522.5774, 2212, 4.7348, 536.8045, 1694, 3.1416, 0.0000, 346, 4.746, 1052.268, 234, 5.189, 1066.495, 196, 6.186, 7.114, 150, 3.927, 1589.073, 114, 3.439, 632.784, 97, 2.91, 949.18, 82, 5.08, 1162.47, 77, 2.51, 103.09, 77, 0.61, 419.48, 74, 5.50, 515.46, 61, 5.45, 213.30, 50, 3.95, 735.88, 46, 0.54, 110.21, 45, 1.90, 846.08, 37, 4.70, 543.92, 36, 6.11, 316.39, 32, 4.92, 1581.96, 25, 3.94, 2118.76, 23, 5.85, 323.51, 21, 5.63, 1596.19, 17, 5.65, 533.62, 17, 5.67, 1265.57, 17, 5.90, 526.51, 16, 4.43, 1045.15, 13, 4.30, 532.87, 12, 4.30, 525.76, 12, 1.81, 956.29, 11, 6.16, 14.23, 10, 2.03, 206.19, 9, 4.87, 1155.36, 9, 1.56, 426.60, 8, 3.93, 1478.87, 8, 4.20, 1169.59, 8, 3.85, 625.67, 8, 2.99, 942.06, 6, 3.41, 639.90, 5, 0.83, 117.32,
/*B2*/  8094, 1.4632, 529.6910, 813, 3.142, 0.000, 742, 0.957, 522.577, 399, 2.899, 536.805, 342, 1.447, 1059.382, 74, 0.41, 1052.27, 46, 3.48, 1066.50, 30, 1.93, 1589.07, 29, 0.99, 515.46, 23, 4.27, 7.11, 14, 2.92, 543.92, 12, 5.22, 632.78, 11, 4.88, 949.18, 6, 6.21, 1045.15, 6, 0.53, 1581.96, 5, 6.03, 735.88, 5, 1.43, 526.51, 5, 0.92, 1162.47, 5, 4.02, 1596.19, 4, 4.54, 110.21, 3, 1.39, 533.62, 3, 0.42, 419.48, 3, 4.40, 14.23, 3, 2.48, 2118.76, 3, 2.40, 532.87, 3, 2.06, 316.39, 3, 3.98, 323.51, 2, 0.88, 213.30, 2, 0.37, 1155.36, 2, 4.78, 942.06, 2, 3.89, 426.60, 2, 3.90, 846.08, 2, 1.20, 103.09, 2, 5.80, 625.67, 2, 2.24, 525.76, 2, 1.42, 1265.57,
/*B3*/  252, 3.381, 529.691, 122, 2.733, 522.577, 49, 1.04, 536.80, 11, 2.31, 1052.27, 8, 2.77, 515.46, 7, 4.25, 1059.38, 6, 1.78, 1066.50, 4, 1.13, 543.92, 3, 3.14, 0.00, 2, 2.29, 7.11, 2, 1.78, 1045.15, 1, 0.45, 632.78, 1, 0.33, 1589.07, 1, 0.31, 949.18, 1, 1.53, 735.88, 1, 2.64, 14.23, 1, 2.37, 1581.96, 1, 2.48, 1596.19,
/*B4*/  15, 4.53, 522.58, 5, 4.47, 529.69, 4, 5.44, 536.80, 3, 0.00, 0.00, 2, 4.52, 515.46, 1, 4.20, 1052.27, 1, 5.59, 543.92, 1, 0.06, 1066.50,
/*B5*/  1, 0.09, 522.58,
/*R0*/  520887429, 0.000000000, 0.000000000, 25209327, 3.49108640, 529.69096509, 610600, 3.841154, 1059.381930, 282029, 2.574199, 632.783739, 187647, 2.075904, 522.577418, 86793, 0.71001, 419.48464, 72063, 0.21466, 536.80451, 65517, 5.97996, 316.39187, 30135, 2.16132, 949.17561, 29135, 1.67759, 103.09277, 23947, 0.27458, 7.11355, 23453, 3.54023, 735.87651, 22284, 4.19363, 1589.07290, 13033, 2.96043, 1162.47470, 12749, 2.71550, 1052.26838, 9703, 1.9067, 206.1855, 9161, 4.4135, 213.2991, 7895, 2.4791, 426.5982, 7058, 2.1818, 1265.5675, 6138, 6.2642, 846.0828, 5477, 5.6573, 639.8973, 4170, 2.0161, 515.4639, 4137, 2.7222, 625.6702, 3503, 0.5653, 1066.4955, 2617, 2.0099, 1581.9593, 2500, 4.5518, 838.9693, 2128, 6.1275, 742.9901, 1912, 0.8562, 412.3711, 1611, 3.0887, 1368.6603, 1479, 2.6803, 1478.8666, 1231, 1.8904, 323.5054, 1217, 1.8017, 110.2063, 1015, 1.3867, 454.9094, 999, 2.872, 309.278, 961, 4.549, 2118.764, 886, 4.148, 533.623, 821, 1.593, 1898.351, 812, 5.941, 909.819, 777, 3.677, 728.763, 727, 3.988, 1155.361, 655, 2.791, 1685.052, 654, 3.382, 1692.166, 621, 4.823, 956.289, 615, 2.276, 942.062, 562, 0.081, 543.918, 542, 0.284, 525.759, 496, 5.530, 380.128, 470, 2.819, 1795.258, 458, 0.127, 1375.774, 445, 0.146, 14.227, 436, 2.603, 95.979, 346, 1.564, 491.558, 338, 2.799, 1045.155, 319, 1.348, 2214.743, 309, 5.369, 1272.681, 303, 1.154, 5753.385, 294, 2.049, 199.072, 291, 6.031, 1169.588, 291, 3.893, 1471.753, 277, 2.522, 2001.444, 275, 2.989, 526.510, 257, 6.134, 532.872, 239, 3.574, 835.037, 215, 2.636, 2111.650, 201, 2.373, 1258.454, 197, 5.929, 453.425, 192, 0.920, 1596.186, 191, 6.283, 983.116, 177, 2.577, 9683.595, 139, 3.640, 1788.145, 129, 1.106, 2531.135, 128, 4.666, 831.856, 124, 2.262, 2317.836, 120, 2.952, 3.932, 113, 4.862, 528.206, 112, 0.856, 433.712, 106, 5.815, 220.413, 104, 2.222, 74.782, 99, 4.50, 518.65, 94, 2.73, 853.20, 86, 2.11, 1574.85, 86, 2.34, 2428.04, 82, 3.23, 1361.55, 80, 0.89, 430.53, 77, 2.10, 508.35, 70, 3.22, 305.35, 70, 3.04, 302.16, 70, 0.20, 532.14, 68, 3.36, 2104.54, 64, 1.10, 1364.73, 60, 0.96, 494.27, 58, 5.72, 628.85, 58, 3.46, 2008.56, 57, 2.00, 2634.23, 57, 3.92, 2221.86, 54, 0.87, 2847.53, 53, 1.20, 760.26, 52, 4.02, 527.24, 49, 5.60, 2810.92, 46, 2.54, 636.72, 45, 4.90, 2648.45, 45, 1.62, 984.60, 44, 4.43, 1063.31, 44, 1.25, 621.74, 43, 0.03, 1439.51, 42, 0.32, 529.64, 42, 3.52, 529.74, 40, 2.10, 2744.43, 40, 4.39, 1148.25, 40, 2.46, 355.75, 39, 4.71, 569.05, 39, 4.32, 149.56, 38, 2.93, 1677.94, 37, 5.08, 1905.46, 37, 0.84, 530.65, 34, 3.09, 2420.93, 34, 0.76, 643.83, 33, 3.19, 528.73, 32, 2.73, 604.47, 32, 6.19, 3.18, 31, 5.36, 1485.98, 29, 1.84, 1891.24, 28, 2.48, 519.40, 27, 3.92, 2324.95, 27, 1.75, 2950.62, 27, 1.04, 405.26, 26, 0.60, 1055.45, 26, 1.34, 330.62, 26, 0.52, 511.53, 26, 3.46, 458.84, 24, 0.88, 423.42, 24, 5.00, 1289.95, 23, 5.27, 672.14, 23, 0.65, 3163.92, 22, 0.43, 1073.61, 22, 5.92, 1802.37, 22, 1.42, 540.74, 21, 3.08, 629.60, 20, 2.73, 39.36, 20, 4.14, 1464.64, 19, 1.86, 3060.83, 19, 5.17, 635.97, 19, 3.66, 415.55, 19, 3.69, 88.87, 19, 1.97, 38.13, 18, 1.90, 1021.25, 18, 3.60, 746.92, 18, 2.67, 1994.33, 17, 2.82, 2737.32, 17, 1.91, 217.23, 17, 5.67, 408.44, 16, 0.18, 1699.28, 16, 3.35, 1056.20, 16, 3.82, 721.65, 15, 1.06, 114.14, 15, 1.32, 117.32, 15, 3.74, 2641.34, 15, 1.33, 490.33, 15, 4.65, 6283.08, 15, 1.67, 529.17, 15, 0.80, 5223.69, 15, 2.17, 530.21, 14, 3.54, 142.45, 13, 1.49, 3267.01, 13, 3.97, 2538.25, 13, 0.74, 908.33, 12, 0.21, 1062.56, 12, 3.67, 750.10, 12, 1.72, 911.30, 12, 2.97, 505.31, 12, 1.67, 2207.63, 12, 5.12, 685.47, 12, 5.23, 524.06, 12, 1.60, 1474.67,
/*R1*/  1271802, 2.6493751, 529.6909651, 61662, 3.00076, 1059.38193, 53444, 3.89718, 522.57742, 41390, 0.00000, 0.00000, 31185, 4.88277, 536.80451, 11847, 2.41330, 419.48464, 9166, 4.7598, 7.1135, 3404, 3.3469, 1589.0729, 3203, 5.2108, 735.8765, 3176, 2.7930, 103.0928, 2806, 3.7422, 515.4639, 2677, 4.3305, 1052.2684, 2600, 3.6344, 206.1855, 2412, 1.4695, 426.5982, 2101, 3.9276, 639.8973, 1646, 5.3095, 1066.4955, 1641, 4.4163, 625.6702, 1050, 3.1611, 213.2991, 1025, 2.5543, 412.3711, 806, 2.678, 632.784, 741, 2.171, 1162.475, 677, 6.250, 838.969, 567, 4.577, 742.990, 485, 2.469, 949.176, 469, 4.710, 543.918, 445, 0.403, 323.505, 416, 5.368, 728.763, 402, 4.605, 309.278, 347, 4.681, 14.227, 338, 3.168, 956.289, 261, 5.343, 846.083, 247, 3.923, 942.062, 220, 4.842, 1368.660, 203, 5.600, 1155.361, 200, 4.439, 1045.155, 197, 3.706, 2118.764, 196, 3.759, 199.072, 184, 4.265, 95.979, 180, 4.402, 532.872, 170, 4.846, 526.510, 146, 6.130, 533.623, 133, 1.322, 110.206, 132, 4.512, 525.759, 124, 2.043, 1478.867, 122, 4.406, 1169.588, 115, 4.467, 1581.959, 111, 3.625, 1272.681, 100, 5.247, 1265.567, 99, 5.73, 1596.19, 92, 4.53, 1685.05, 86, 0.08, 831.86, 82, 3.81, 508.35, 81, 4.11, 1258.45, 80, 2.72, 1692.17, 78, 5.57, 1471.75, 56, 4.75, 302.16, 55, 0.35, 316.39, 52, 5.53, 433.71, 51, 4.86, 1375.77, 49, 4.01, 220.41, 44, 4.94, 1361.55, 42, 1.22, 853.20, 38, 5.33, 1788.14, 38, 4.27, 2001.44, 36, 3.85, 1574.85, 36, 1.76, 1795.26, 29, 5.17, 3.93, 27, 6.10, 1148.25, 25, 4.34, 519.40, 25, 2.73, 405.26, 23, 0.19, 380.13, 20, 4.33, 3.18, 20, 4.63, 1677.94, 20, 5.11, 1073.61, 19, 5.05, 2104.54, 18, 6.03, 330.62, 18, 3.77, 1485.98, 17, 4.02, 2317.84, 17, 5.43, 88.87, 16, 2.93, 1905.46, 15, 2.93, 2008.56, 15, 5.51, 721.65, 14, 3.63, 628.85, 14, 2.74, 2221.86, 14, 4.88, 629.60, 13, 1.39, 518.65, 13, 5.84, 1464.64, 12, 1.59, 2111.65, 12, 3.38, 635.97, 12, 4.08, 2648.45, 11, 2.58, 511.53, 11, 3.55, 1891.24, 11, 4.63, 636.72, 10, 0.50, 453.42, 10, 2.76, 423.42, 10, 4.39, 1994.33, 9, 4.33, 1802.37, 9, 4.79, 2420.93, 9, 4.81, 1062.56, 9, 1.86, 750.10, 9, 5.16, 1056.20, 9, 4.54, 21.34, 8, 3.73, 2634.23, 8, 1.29, 2428.04, 7, 3.02, 416.30, 7, 4.98, 1699.28, 7, 4.98, 1898.35, 7, 4.99, 1055.45, 7, 5.97, 540.74, 7, 2.91, 2324.95, 7, 5.55, 1781.03, 7, 4.57, 1038.04, 6, 1.39, 422.67, 6, 6.14, 2125.88, 6, 4.46, 551.03, 6, 3.87, 191.96, 6, 3.66, 621.74, 6, 2.58, 569.05, 6, 4.23, 539.99, 5, 5.63, 618.56, 5, 4.91, 835.04, 5, 0.18, 117.32, 5, 6.22, 963.40, 5, 0.07, 1063.31, 5, 1.35, 1382.89, 5, 4.56, 2737.32, 5, 4.61, 643.83, 5, 3.35, 2207.63, 5, 4.24, 227.53, 5, 4.08, 2310.72, 4, 1.48, 408.44, 4, 0.19, 824.74, 4, 4.61, 647.01, 4, 2.38, 2538.25, 4, 1.13, 415.55, 4, 4.10, 430.53, 4, 1.15, 74.78, 4, 3.43, 2950.62, 4, 1.03, 2744.43, 4, 2.19, 534.36, 4, 4.12, 440.83, 4, 4.64, 2214.74, 4, 5.29, 2097.42, 4, 1.63, 525.03,
/*R2*/  79645, 1.35866, 529.69097, 8252, 5.7777, 522.5774, 7030, 3.2748, 536.8045, 5314, 1.8384, 1059.3819, 1861, 2.9768, 7.1135, 964, 5.480, 515.464, 836, 4.199, 419.485, 498, 3.142, 0.000, 427, 2.228, 639.897, 406, 3.783, 1066.495, 377, 2.242, 1589.073, 363, 5.368, 206.186, 342, 6.099, 1052.268, 339, 6.127, 625.670, 333, 0.003, 426.598, 280, 4.262, 412.371, 257, 0.963, 632.784, 230, 0.705, 735.877, 201, 3.069, 543.918, 200, 4.429, 103.093, 139, 2.932, 14.227, 114, 0.787, 728.763, 95, 1.70, 838.97, 86, 5.14, 323.51, 83, 0.06, 309.28, 80, 2.98, 742.99, 75, 1.60, 956.29, 70, 1.51, 213.30, 67, 5.47, 199.07, 62, 6.10, 1045.15, 56, 0.96, 1162.47, 52, 5.58, 942.06, 50, 2.72, 532.87, 45, 5.52, 508.35, 44, 0.27, 526.51, 40, 5.95, 95.98, 30, 0.94, 1155.36, 29, 1.79, 831.86, 28, 2.88, 525.76, 27, 2.65, 2118.76, 27, 2.81, 1169.59, 26, 4.27, 1596.19, 23, 0.18, 302.16, 22, 1.89, 1272.68, 21, 4.35, 316.39, 21, 0.54, 1265.57, 20, 0.04, 949.18, 20, 1.16, 533.62, 20, 0.06, 1581.96, 18, 4.15, 846.08, 17, 5.89, 1258.45, 17, 0.53, 1368.66, 13, 0.79, 110.21, 13, 3.90, 433.71, 12, 2.23, 220.41, 12, 0.41, 1361.55, 12, 4.44, 405.26, 10, 1.00, 1471.75, 10, 6.01, 853.20, 9, 1.51, 1148.25, 9, 1.60, 1692.17, 9, 6.27, 519.40, 9, 3.52, 1073.61, 8, 5.60, 1574.85, 8, 0.18, 1685.05, 8, 0.65, 1478.87, 7, 0.88, 88.87, 7, 0.89, 721.65, 7, 4.44, 330.62, 6, 2.50, 3.18, 5, 0.85, 1788.14, 5, 2.79, 21.34, 5, 2.98, 1375.77, 5, 0.05, 1677.94, 5, 0.86, 3.93, 5, 2.28, 1485.98, 4, 1.28, 1464.64, 4, 0.41, 629.60, 4, 1.61, 635.97, 4, 2.71, 551.03, 3, 2.45, 539.99, 3, 0.55, 1795.26, 3, 1.19, 1905.46, 3, 6.19, 1038.04, 3, 5.55, 191.96, 3, 6.23, 2001.44, 3, 4.82, 416.30, 3, 0.55, 2104.54, 3, 3.24, 1062.56, 3, 0.03, 1898.35, 3, 1.24, 2221.86, 3, 2.40, 227.53, 2, 0.07, 750.10, 2, 4.28, 963.40, 2, 1.95, 824.74, 2, 6.19, 1994.33, 2, 1.72, 628.85, 2, 5.33, 1891.24, 2, 1.05, 1781.03, 2, 3.33, 1699.28, 2, 4.62, 423.42, 2, 0.29, 636.72, 2, 0.29, 2111.65, 2, 0.32, 295.05, 2, 3.44, 647.01, 2, 2.79, 1802.37, 2, 3.14, 611.44, 2, 1.12, 618.56, 2, 4.72, 2125.88, 2, 1.60, 2008.56, 2, 3.01, 2648.45, 2, 2.32, 440.83, 2, 5.89, 2317.84, 2, 2.42, 10.29, 2, 0.37, 1056.20, 2, 3.52, 1055.45, 2, 5.83, 422.67, 2, 5.76, 117.32, 1, 0.08, 1382.89, 1, 0.18, 2420.93, 1, 1.20, 1063.31, 1, 0.76, 2097.42, 1, 5.99, 2310.72, 1, 1.59, 380.13, 1, 4.20, 547.85, 1, 4.23, 934.95, 1, 3.86, 1603.30, 1, 1.35, 732.70, 1, 1.55, 2324.95, 1, 5.60, 99.91, 1, 6.18, 945.99, 1, 1.03, 81.75, 1, 0.09, 2737.32, 1, 2.54, 6283.08, 1, 1.15, 952.36, 1, 5.22, 2207.63, 1, 6.01, 511.53, 1, 3.03, 3046.60, 1, 2.71, 3370.10, 1, 6.01, 2214.74, 1, 5.00, 319.57, 1, 3.91, 10213.29, 1, 2.52, 3679.38, 1, 4.69, 5746.27, 1, 2.39, 3267.01, 1, 0.77, 5760.50, 1, 6.12, 9676.48, 1, 3.99, 337.73, 1, 2.19, 9690.71, 1, 1.12, 739.81, 1, 5.93, 2634.23, 1, 1.15, 2641.34, 1, 0.73, 1354.43, 1, 0.65, 2538.25, 1, 4.84, 860.31, 1, 4.23, 9683.59, 1, 1.20, 124.43, 1, 5.44, 107.02, 1, 0.90, 106.27, 1, 2.22, 2015.67, 1, 6.00, 501.24, 1, 5.12, 3156.81, 1, 1.24, 3803.82, 1, 2.43, 739.06, 1, 2.98, 1262.39, 1, 6.00, 1049.09, 1, 1.85, 453.42, 1, 6.19, 1987.22, 1, 5.33, 2751.55, 1, 4.92, 447.80, 1, 1.00, 462.02, 1, 4.77, 3473.20, 1, 5.61, 2524.02, 1, 5.82, 2627.11, 1, 2.43, 3686.50, 1, 3.89, 2516.91, 1, 3.55, 3178.15, 1, 3.29, 4.67, 1, 5.36, 9.56,
/*R3*/  3519, 6.0580, 529.6910, 1073, 1.6732, 536.8045, 916, 1.413, 522.577, 342, 0.523, 1059.382, 255, 1.196, 7.114, 222, 0.952, 515.464, 90, 3.14, 0.00, 69, 2.27, 1066.50, 58, 1.41, 543.92, 58, 0.53, 639.90, 51, 5.98, 412.37, 47, 1.58, 625.67, 43, 6.12, 419.48, 37, 1.18, 14.23, 34, 1.67, 1052.27, 34, 0.85, 206.19, 31, 1.04, 1589.07, 30, 4.63, 426.60, 21, 2.50, 728.76, 15, 0.89, 199.07, 14, 0.96, 508.35, 13, 1.50, 1045.15, 12, 2.61, 735.88, 12, 3.56, 323.51, 11, 1.79, 309.28, 11, 6.28, 956.29, 10, 6.26, 103.09, 9, 3.45, 838.97, 7, 1.28, 742.99, 7, 0.92, 942.06, 7, 3.45, 831.86, 7, 1.87, 302.16, 6, 1.38, 95.98, 5, 2.83, 1596.19, 4, 1.21, 1169.59, 4, 5.99, 213.30, 4, 6.11, 405.26, 3, 2.33, 1155.36, 2, 0.35, 1272.68, 2, 1.87, 532.87, 2, 0.43, 220.41, 2, 5.97, 1162.47, 2, 1.95, 1073.61, 2, 0.09, 632.78, 2, 1.59, 2118.76, 2, 1.51, 1258.45, 2, 1.07, 21.34, 2, 2.16, 433.71, 2, 5.94, 110.21, 2, 3.17, 1148.25, 2, 2.55, 88.87, 2, 2.70, 721.65, 2, 2.26, 1361.55, 2, 1.98, 525.76, 2, 2.71, 330.62, 2, 0.44, 533.62, 2, 4.46, 853.20, 2, 0.47, 526.51, 2, 0.12, 949.18, 1, 0.67, 551.03, 1, 1.17, 1038.04, 1, 3.02, 963.40, 1, 1.16, 1574.85, 1, 2.55, 846.08, 1, 1.79, 1581.96, 1, 1.07, 227.53, 1, 2.70, 519.40, 1, 4.17, 2627.11, 1, 3.69, 824.74, 1, 4.91, 1670.83, 1, 2.93, 1368.66, 1, 0.60, 539.99, 1, 4.52, 750.10, 1, 0.94, 191.96, 1, 4.87, 611.44, 1, 0.21, 1141.13, 1, 3.23, 2125.88, 1, 2.39, 2317.84, 1, 2.25, 2538.25, 1, 5.80, 1485.98, 1, 2.27, 1699.28, 1, 0.67, 440.83, 1, 2.48, 1265.57, 1, 5.51, 2413.82, 1, 4.41, 1382.89, 1, 6.14, 1279.79, 1, 1.93, 2634.23, 1, 2.18, 1062.56, 1, 1.96, 1677.94, 1, 2.32, 1471.75, 1, 2.05, 295.05, 1, 2.50, 2207.63, 1, 0.19, 10.29,
/*R4*/  129, 0.084, 536.805, 113, 4.249, 529.691, 83, 3.30, 522.58, 38, 2.73, 515.46, 27, 5.69, 7.11, 18, 5.40, 1059.38, 13, 6.02, 543.92, 9, 0.77, 1066.50, 8, 5.68, 14.23, 7, 1.43, 412.37, 6, 5.12, 639.90, 5, 3.34, 625.67, 3, 3.40, 1052.27, 3, 4.16, 728.76, 3, 2.90, 426.60, 2, 6.22, 1589.07, 2, 3.12, 1045.15, 2, 1.89, 419.48, 2, 2.60, 199.07, 2, 0.00, 0.00, 2, 2.81, 206.19, 2, 1.33, 1596.19, 1, 5.16, 831.86, 1, 4.42, 956.29, 1, 5.47, 220.41, 1, 0.67, 1361.55, 1, 1.87, 1148.25, 1, 3.17, 508.35, 1, 5.79, 1169.59, 1, 1.48, 1272.68, 1, 2.42, 117.32, 1, 2.20, 942.06, 1, 5.31, 551.03, 1, 0.50, 1073.61, 1, 2.85, 191.96, 1, 3.72, 88.87, 1, 3.53, 302.16, 1, 1.84, 10.29, 1, 1.59, 3.18, 1, 3.82, 618.56, 1, 0.86, 330.62, 1, 5.26, 21.34, 1, 1.83, 647.01, 1, 0.24, 433.71, 1, 4.44, 110.21,
/*R5*/  11, 4.75, 536.80, 4, 5.92, 522.58, 2, 5.57, 515.46, 2, 4.30, 543.92, 2, 3.69, 7.11, 2, 4.13, 1059.38, 2, 5.49, 1066.50, 1, 3.78, 14.23, 1, 4.51, 529.69),

  //Dsat精度:J2000+-4千年 黄经0.5角秒 黄纬0.5角秒 距离5AU/10^6
  new Array(
    100000000,//A的倍率
    20, 806, 1406, 1946, 2177, 2282, 2333, 2537, 2726, 2867, 2963, 3008, 3026, 4091, 5063, 5789, 6260, 6452, 6536,//位置索引表
/*L0*/  87401354, 0.00000000, 0.00000000, 11107660, 3.96205090, 213.29909544, 1414151, 4.5858152, 7.1135470, 398379, 0.521120, 206.185548, 350769, 3.303299, 426.598191, 206816, 0.246584, 103.092774, 79271, 3.84007, 220.41264, 23990, 4.66977, 110.20632, 16574, 0.43719, 419.48464, 15820, 0.93809, 632.78374, 15054, 2.71670, 639.89729, 14907, 5.76903, 316.39187, 14610, 1.56519, 3.93215, 13160, 4.44891, 14.22709, 13005, 5.98119, 11.04570, 10725, 3.12940, 202.25340, 6126, 1.7633, 277.0350, 5863, 0.2366, 529.6910, 5228, 4.2078, 3.1814, 5020, 3.1779, 433.7117, 4593, 0.6198, 199.0720, 4006, 2.2448, 63.7359, 3874, 3.2228, 138.5175, 3269, 0.7749, 949.1756, 2954, 0.9828, 95.9792, 2461, 2.0316, 735.8765, 1758, 3.2658, 522.5774, 1640, 5.5050, 846.0828, 1581, 4.3727, 309.2783, 1391, 4.0233, 323.5054, 1124, 2.8373, 415.5525, 1087, 4.1834, 2.4477, 1017, 3.7170, 227.5262, 957, 0.507, 1265.567, 853, 3.421, 175.166, 849, 3.191, 209.367, 789, 5.007, 0.963, 749, 2.144, 853.196, 744, 5.253, 224.345, 687, 1.747, 1052.268, 654, 1.599, 0.048, 634, 2.299, 412.371, 625, 0.970, 210.118, 580, 3.093, 74.782, 546, 2.127, 350.332, 543, 1.518, 9.561, 530, 4.449, 117.320, 478, 2.965, 137.033, 474, 5.475, 742.990, 452, 1.044, 490.334, 449, 1.290, 127.472, 372, 2.278, 217.231, 355, 3.013, 838.969, 347, 1.539, 340.771, 343, 0.246, 0.521, 330, 0.247, 1581.959, 322, 0.961, 203.738, 322, 2.572, 647.011, 309, 3.495, 216.480, 287, 2.370, 351.817, 278, 0.400, 211.815, 249, 1.470, 1368.660, 227, 4.910, 12.530, 220, 4.204, 200.769, 209, 1.345, 625.670, 208, 0.483, 1162.475, 208, 1.283, 39.357, 205, 6.011, 265.989, 185, 3.503, 149.563, 184, 0.973, 4.193, 182, 5.491, 2.921, 174, 1.863, 0.751, 165, 0.440, 5.417, 149, 5.736, 52.690, 148, 1.535, 5.629, 146, 6.231, 195.140, 140, 4.295, 21.341, 131, 4.068, 10.295, 125, 6.277, 1898.351, 122, 1.976, 4.666, 118, 5.341, 554.070, 117, 2.679, 1155.361, 114, 5.594, 1059.382, 112, 1.105, 191.208, 110, 0.166, 1.484, 109, 3.438, 536.805, 107, 4.012, 956.289, 104, 2.192, 88.866, 103, 1.197, 1685.052, 101, 4.965, 269.921, 97, 4.54, 302.16, 96, 2.83, 275.55, 91, 1.88, 38.13, 90, 5.80, 114.14, 89, 3.86, 278.52, 84, 5.49, 0.11, 83, 2.29, 628.85, 82, 3.05, 440.83, 79, 4.45, 35.42, 76, 1.61, 284.15, 75, 2.18, 728.76, 74, 5.09, 1375.77, 72, 5.11, 65.22, 70, 4.87, 0.21, 70, 3.71, 14.98, 69, 3.44, 515.46, 68, 0.73, 1478.87, 67, 0.03, 70.85, 66, 2.02, 142.45, 64, 3.32, 62.25, 63, 3.49, 479.29, 63, 2.59, 422.67, 61, 1.50, 210.85, 61, 2.69, 388.47, 55, 0.97, 942.06, 54, 2.46, 22.09, 54, 0.78, 191.96, 53, 3.18, 8.08, 53, 5.51, 0.26, 51, 4.27, 99.16, 50, 6.03, 2214.74, 49, 2.39, 1471.75, 47, 2.03, 312.20, 47, 4.60, 437.64, 46, 0.54, 212.34, 45, 0.93, 2001.44, 45, 1.12, 6.15, 44, 3.93, 525.50, 43, 2.53, 288.08, 43, 1.37, 563.63, 43, 3.82, 330.62, 42, 1.90, 430.53, 40, 5.71, 408.44, 40, 1.63, 1066.50, 38, 0.31, 423.42, 38, 1.20, 2.71, 38, 3.70, 1272.68, 38, 4.52, 24.38, 36, 6.01, 18.16, 36, 0.85, 213.35, 36, 3.93, 213.25, 35, 4.19, 215.75, 35, 4.46, 214.26, 35, 1.02, 203.00, 33, 0.54, 107.02, 33, 0.66, 692.59, 33, 0.81, 1795.26, 32, 5.22, 92.05, 32, 5.59, 6069.78, 32, 1.69, 0.16, 32, 5.50, 56.62, 31, 0.37, 703.63, 31, 6.14, 417.04, 30, 0.72, 222.86, 30, 5.30, 33.94, 29, 0.15, 131.40, 29, 1.20, 404.51, 28, 5.64, 128.96, 28, 1.46, 7.16, 27, 6.23, 1.27, 27, 1.90, 1045.15, 27, 0.07, 205.22, 27, 4.57, 7.07, 26, 5.41, 140.00, 26, 4.36, 32.24, 24, 3.09, 145.63, 24, 3.94, 414.07, 24, 2.54, 76.27, 23, 3.97, 483.22, 23, 2.10, 1788.14, 23, 3.20, 208.63, 23, 3.66, 207.67, 23, 6.10, 177.87, 23, 5.24, 212.78, 22, 5.92, 173.94, 21, 0.72, 1258.45, 21, 5.79, 2531.13, 21, 2.02, 860.31, 21, 0.67, 2317.84, 21, 5.22, 6.59, 20, 2.82, 429.78, 20, 5.07, 617.81, 19, 1.64, 565.12, 19, 5.94, 425.11, 19, 5.78, 213.82, 18, 0.73, 9999.99, 18, 5.23, 73.30, 18, 6.11, 210.38, 18, 3.14, 831.86, 17, 0.24, 134.59, 17, 0.72, 2111.65, 17, 3.28, 98.90, 16, 3.97, 355.75, 16, 3.10, 106.27, 15, 3.29, 1589.07, 15, 3.25, 78.71, 15, 5.19, 305.35, 15, 2.75, 1.22, 14, 3.88, 54.17, 14, 4.52, 59.80, 14, 1.72, 69.15, 14, 6.18, 245.54, 14, 2.37, 125.99, 14, 2.55, 405.26, 14, 2.54, 1.70, 14, 3.59, 234.64, 13, 0.83, 99.91, 13, 4.17, 225.83, 13, 6.01, 214.78, 13, 4.69, 767.37, 13, 5.31, 344.70, 12, 2.12, 28.31, 12, 3.60, 124.43, 12, 1.62, 1361.55, 12, 4.07, 280.97, 12, 4.00, 267.47, 12, 0.12, 7.63, 12, 2.79, 362.86, 11, 5.51, 192.69, 11, 1.82, 2104.54, 11, 2.62, 7.86, 11, 2.61, 339.29, 11, 5.51, 199.28, 11, 3.58, 1.44, 11, 0.19, 217.49, 11, 2.37, 831.10, 10, 2.84, 85.83, 10, 1.69, 31.02, 10, 4.72, 216.22, 10, 0.22, 198.32, 10, 0.22, 144.15, 10, 3.61, 14.01, 10, 3.94, 207.88, 10, 4.02, 207.15, 10, 0.42, 2634.23, 10, 1.61, 0.89, 10, 3.67, 212.55, 10, 3.34, 223.59, 10, 0.64, 218.93, 9, 0.72, 347.88, 9, 4.26, 20.61, 9, 5.40, 342.26, 9, 4.28, 312.46, 9, 5.08, 241.61, 9, 4.25, 46.47, 9, 1.65, 210.33, 9, 0.91, 497.45, 9, 5.81, 329.73, 9, 4.23, 6.36, 9, 0.57, 2428.04, 9, 5.36, 343.22, 9, 5.55, 2847.53, 9, 4.48, 1692.17, 9, 0.49, 1574.85, 8, 4.06, 237.68, 8, 0.81, 264.50, 8, 4.71, 333.66, 8, 2.73, 4.14, 8, 3.82, 380.13, 8, 5.54, 116.43, 8, 5.63, 518.65, 8, 5.44, 621.74,
/*L1*/  21354295596, 0.00000000000, 0.00000000000, 1296855, 1.8282054, 213.2990954, 564348, 2.885001, 7.113547, 107679, 2.277699, 206.185548, 98323, 1.08070, 426.59819, 40255, 2.04128, 220.41264, 19942, 1.27955, 103.09277, 10512, 2.74880, 14.22709, 6939, 0.4049, 639.8973, 4803, 2.4419, 419.4846, 4056, 2.9217, 110.2063, 3769, 3.6497, 3.9322, 3385, 2.4169, 3.1814, 3302, 1.2626, 433.7117, 3071, 2.3274, 199.0720, 1953, 3.5639, 11.0457, 1249, 2.6280, 95.9792, 922, 1.961, 227.526, 706, 4.417, 529.691, 650, 6.174, 202.253, 628, 6.111, 309.278, 487, 6.040, 853.196, 479, 4.988, 522.577, 468, 4.617, 63.736, 417, 2.117, 323.505, 408, 1.299, 209.367, 352, 2.317, 632.784, 344, 3.959, 412.371, 340, 3.634, 316.392, 336, 3.772, 735.877, 332, 2.861, 210.118, 289, 2.733, 117.320, 281, 5.744, 2.448, 266, 0.543, 647.011, 230, 1.644, 216.480, 192, 2.965, 224.345, 173, 4.077, 846.083, 167, 2.597, 21.341, 136, 2.286, 10.295, 131, 3.441, 742.990, 128, 4.095, 217.231, 109, 6.161, 415.552, 98, 4.73, 838.97, 94, 3.48, 1052.27, 92, 3.95, 88.87, 87, 1.22, 440.83, 83, 3.11, 625.67, 78, 6.24, 302.16, 67, 0.29, 4.67, 66, 5.65, 9.56, 62, 4.29, 127.47, 62, 1.83, 195.14, 58, 2.48, 191.96, 57, 5.02, 137.03, 55, 0.28, 74.78, 54, 5.13, 490.33, 51, 1.46, 536.80, 47, 1.18, 149.56, 47, 5.15, 515.46, 46, 2.23, 956.29, 44, 2.71, 5.42, 40, 0.41, 269.92, 40, 3.89, 728.76, 38, 0.65, 422.67, 38, 2.53, 12.53, 37, 3.78, 2.92, 35, 6.08, 5.63, 34, 3.21, 1368.66, 33, 4.64, 277.03, 33, 5.43, 1066.50, 33, 0.30, 351.82, 32, 4.39, 1155.36, 31, 2.43, 52.69, 30, 2.84, 203.00, 30, 6.19, 284.15, 30, 3.39, 1059.38, 29, 2.03, 330.62, 28, 2.74, 265.99, 26, 4.51, 340.77, 23, 4.14, 191.21, 23, 5.89, 210.85, 22, 1.96, 203.74, 22, 5.14, 4.19, 22, 2.68, 942.06, 21, 6.16, 860.31, 20, 2.31, 437.64, 19, 4.77, 70.85, 19, 4.10, 18.16, 18, 0.90, 429.78, 18, 1.85, 234.64, 18, 2.45, 423.42, 17, 5.97, 628.85, 16, 4.06, 949.18, 16, 1.94, 1272.68, 16, 1.06, 56.62, 16, 5.59, 6.15, 15, 4.24, 1162.47, 15, 0.74, 200.77, 15, 5.77, 22.09, 15, 3.60, 1045.15, 14, 2.94, 1685.05, 14, 1.44, 408.44, 14, 4.10, 1471.75, 13, 6.25, 38.13, 13, 5.76, 138.52, 13, 4.25, 405.26, 12, 4.85, 831.86, 12, 1.86, 131.40, 12, 1.81, 124.43, 11, 1.55, 223.59, 11, 5.37, 215.75, 10, 3.47, 1375.77, 10, 6.08, 32.24, 10, 2.38, 107.02, 10, 3.95, 430.53, 10, 2.55, 99.91, 10, 1.39, 145.63, 9, 5.81, 7.16, 9, 3.65, 142.45, 9, 4.95, 208.63, 9, 1.24, 106.27, 9, 0.08, 288.08, 8, 4.42, 703.63, 8, 5.64, 62.25, 8, 2.42, 1258.45, 8, 6.22, 14.98, 8, 0.53, 654.12, 8, 3.75, 312.20, 7, 4.85, 222.86, 7, 0.28, 0.75, 7, 0.53, 388.47, 7, 2.05, 99.16, 7, 0.24, 8.08, 7, 5.83, 483.22, 7, 3.49, 35.42, 6, 2.89, 114.14, 6, 3.33, 1361.55, 6, 3.81, 1788.14, 6, 0.55, 65.22, 6, 1.63, 1589.07, 6, 2.68, 2001.44, 6, 0.89, 92.05, 6, 4.39, 81.75, 5, 5.48, 563.63, 5, 4.58, 134.59, 5, 2.12, 214.26, 5, 4.68, 212.34, 5, 3.34, 1.48, 5, 5.77, 565.12, 5, 2.20, 207.88, 5, 4.20, 404.51, 5, 0.42, 76.27, 5, 3.78, 1265.57, 5, 0.46, 362.86, 5, 4.53, 1148.25, 5, 4.59, 554.07, 5, 5.80, 217.96, 5, 3.25, 231.46, 5, 5.38, 497.45, 4, 0.11, 295.05, 4, 1.80, 213.25, 4, 5.00, 213.35, 4, 4.88, 98.90, 4, 0.59, 750.10, 4, 0.99, 24.38, 4, 0.82, 344.70, 4, 0.81, 343.22, 4, 5.13, 218.93, 4, 1.61, 245.54, 4, 0.35, 333.66, 3, 5.30, 350.33, 3, 1.85, 225.83, 3, 2.20, 1574.85, 3, 5.31, 347.88, 3, 0.21, 635.97, 3, 2.88, 216.22, 3, 1.72, 1169.59, 3, 1.92, 17.41, 3, 3.04, 1677.94, 3, 4.31, 6062.66, 3, 1.34, 543.92, 3, 0.25, 120.36, 3, 3.36, 7.86, 3, 2.53, 1692.17, 3, 2.49, 46.47, 3, 3.53, 2104.54, 3, 4.87, 144.15, 3, 5.73, 9992.87, 3, 3.73, 6076.89, 3, 0.24, 357.45, 3, 2.43, 2317.84, 3, 5.76, 618.56, 3, 5.15, 10007.10, 3, 0.72, 85.83, 3, 3.43, 31.02, 3, 3.80, 17.27, 3, 1.63, 182.28, 3, 0.92, 479.29, 3, 4.52, 198.32, 3, 2.11, 168.05,
/*L2*/  116441, 1.179879, 7.113547, 91921, 0.07425, 213.29910, 90592, 0.00000, 0.00000, 15277, 4.06492, 206.18555, 10631, 0.25778, 220.41264, 10605, 5.40964, 426.59819, 4265, 1.0460, 14.2271, 1216, 2.9186, 103.0928, 1165, 4.6094, 639.8973, 1082, 5.6913, 433.7117, 1045, 4.0421, 199.0720, 1020, 0.6337, 3.1814, 634, 4.388, 419.485, 549, 5.573, 3.932, 457, 1.268, 110.206, 425, 0.209, 227.526, 274, 4.288, 95.979, 162, 1.381, 11.046, 129, 1.566, 309.278, 117, 3.881, 853.196, 105, 4.900, 647.011, 101, 0.893, 21.341, 96, 2.91, 316.39, 95, 5.63, 412.37, 85, 5.73, 209.37, 83, 6.05, 216.48, 82, 1.02, 117.32, 75, 4.76, 210.12, 67, 0.46, 522.58, 66, 0.48, 10.29, 64, 0.35, 323.51, 61, 4.88, 632.78, 53, 2.75, 529.69, 46, 5.69, 440.83, 45, 1.67, 202.25, 42, 5.71, 88.87, 32, 0.07, 63.74, 32, 1.67, 302.16, 31, 4.16, 191.96, 27, 0.83, 224.34, 25, 5.66, 735.88, 20, 5.94, 217.23, 18, 4.90, 625.67, 17, 1.63, 742.99, 16, 0.58, 515.46, 14, 0.21, 838.97, 14, 3.76, 195.14, 12, 4.72, 203.00, 12, 0.13, 234.64, 12, 3.12, 846.08, 11, 5.92, 536.80, 11, 5.60, 728.76, 11, 3.20, 1066.50, 10, 4.99, 422.67, 10, 0.26, 330.62, 10, 4.15, 860.31, 9, 0.46, 956.29, 8, 2.14, 269.92, 8, 5.25, 429.78, 8, 4.03, 9.56, 7, 5.40, 1052.27, 6, 4.46, 284.15, 6, 5.93, 405.26, 6, 5.41, 149.56, 6, 4.29, 415.55, 6, 0.02, 124.43, 6, 6.02, 223.59, 6, 0.30, 127.47, 5, 5.54, 949.18, 5, 3.20, 277.03, 5, 4.93, 654.12, 5, 2.27, 18.16, 5, 6.14, 1155.36, 5, 4.41, 942.06, 4, 2.89, 56.62, 4, 4.69, 74.78, 4, 5.31, 1045.15, 4, 0.29, 831.86, 4, 0.37, 12.53, 4, 6.10, 81.75, 4, 3.30, 490.33, 4, 4.93, 52.69, 4, 0.41, 137.03, 4, 0.15, 437.64, 4, 0.20, 1272.68, 3, 4.77, 423.42, 3, 4.29, 99.91, 3, 1.57, 1059.38, 3, 3.13, 70.85, 3, 0.33, 191.21, 3, 3.38, 408.44, 3, 1.88, 295.05, 3, 5.15, 1368.66, 3, 3.59, 131.40, 3, 5.12, 265.99, 2, 1.59, 32.24, 2, 3.90, 210.85, 2, 5.83, 106.27, 2, 4.77, 351.82, 2, 3.14, 22.09, 2, 5.98, 6062.66, 2, 2.06, 6076.89, 2, 5.95, 145.63, 2, 5.23, 1265.57, 2, 1.12, 9992.87, 2, 3.48, 10007.10, 2, 5.87, 1471.75, 2, 4.52, 138.52, 2, 4.15, 1258.45, 2, 5.05, 1361.55, 2, 4.14, 107.02, 2, 1.36, 231.46, 2, 6.24, 1148.25, 2, 3.75, 628.85, 2, 5.62, 447.94, 2, 5.97, 430.53, 1, 0.48, 340.77, 1, 0.85, 6069.78, 1, 2.91, 215.75, 1, 0.71, 28.45, 1, 2.28, 9999.99, 1, 5.84, 543.92, 1, 6.24, 1589.07, 1, 2.83, 200.77, 1, 3.52, 497.45, 1, 0.72, 508.35, 1, 2.61, 1279.79, 1, 4.96, 1685.05, 1, 1.20, 618.56, 1, 4.53, 635.97, 1, 1.09, 184.84, 1, 2.41, 703.63, 1, 3.40, 1073.61, 1, 4.91, 750.10, 1, 1.39, 483.22, 1, 1.59, 1375.77, 1, 2.66, 134.59, 1, 4.21, 288.08, 1, 4.68, 362.86, 1, 2.43, 222.86, 1, 4.52, 38.13, 1, 5.01, 1581.96, 1, 5.59, 1788.14, 1, 0.77, 113.39, 1, 4.80, 1677.94, 1, 2.22, 333.66, 1, 5.95, 1464.64, 1, 4.49, 643.08, 1, 5.82, 416.30, 1, 2.51, 343.22, 1, 3.97, 1574.85, 1, 4.84, 76.27, 1, 6.00, 337.73, 1, 2.28, 1162.47, 1, 2.35, 120.36, 1, 3.67, 347.88, 1, 0.01, 1169.59, 1, 0.21, 99.16, 1, 2.89, 92.05, 1, 5.63, 17.27, 1, 3.76, 203.74, 1, 5.75, 721.65, 1, 3.78, 217.96, 1, 0.68, 46.47, 1, 4.86, 357.45, 1, 5.27, 436.89, 1, 3.27, 208.63, 1, 3.88, 565.12, 1, 5.99, 1905.46, 1, 3.69, 350.33, 1, 4.96, 358.93, 1, 0.31, 98.90, 1, 1.22, 62.25, 1, 0.87, 1692.17, 1, 6.17, 182.28, 1, 2.59, 313.21, 1, 1.54, 195.89, 1, 5.42, 312.20, 1, 4.71, 2001.44, 1, 3.81, 168.05,
/*L3*/  16039, 5.73945, 7.11355, 4250, 4.5854, 213.2991, 1907, 4.7608, 220.4126, 1466, 5.9133, 206.1855, 1162, 5.6197, 14.2271, 1067, 3.6082, 426.5982, 239, 3.861, 433.712, 237, 5.768, 199.072, 166, 5.116, 3.181, 151, 2.736, 639.897, 131, 4.743, 227.526, 63, 0.23, 419.48, 62, 4.74, 103.09, 40, 5.47, 21.34, 40, 5.96, 95.98, 39, 5.83, 110.21, 28, 3.01, 647.01, 25, 0.99, 3.93, 19, 1.92, 853.20, 18, 4.97, 10.29, 18, 1.03, 412.37, 18, 4.20, 216.48, 18, 3.32, 309.28, 16, 3.90, 440.83, 16, 5.62, 117.32, 13, 1.18, 88.87, 11, 5.58, 11.05, 11, 5.93, 191.96, 10, 3.95, 209.37, 9, 3.39, 302.16, 8, 4.88, 323.51, 7, 0.38, 632.78, 6, 2.25, 522.58, 6, 1.06, 210.12, 5, 4.64, 234.64, 4, 3.14, 0.00, 4, 2.31, 515.46, 3, 2.20, 860.31, 3, 0.59, 529.69, 3, 4.93, 224.34, 3, 0.42, 625.67, 2, 4.77, 330.62, 2, 3.35, 429.78, 2, 3.20, 202.25, 2, 1.19, 1066.50, 2, 1.35, 405.26, 2, 4.16, 223.59, 2, 3.07, 654.12, 2, 1.03, 728.76, 2, 4.40, 124.43, 2, 3.09, 422.67, 2, 4.15, 536.80, 2, 5.83, 195.14, 2, 6.04, 742.99, 1, 0.38, 316.39, 1, 1.58, 81.75, 1, 2.11, 838.97, 1, 1.38, 735.88, 1, 2.33, 217.23, 1, 5.02, 956.29, 1, 1.66, 63.74, 1, 3.88, 269.92, 1, 3.73, 295.05, 1, 2.76, 284.15, 1, 3.31, 18.16, 1, 2.02, 831.86, 1, 0.71, 846.08, 1, 3.84, 447.94, 1, 4.71, 56.62, 1, 0.80, 1045.15, 1, 2.41, 203.00, 1, 4.27, 437.64, 1, 1.65, 423.42, 1, 6.18, 942.06, 1, 2.86, 184.84, 1, 6.26, 1059.38, 1, 3.43, 149.56,
/*L4*/  1662, 3.9983, 7.1135, 257, 2.984, 220.413, 236, 3.902, 14.227, 149, 2.741, 213.299, 114, 3.142, 0.000, 110, 1.515, 206.186, 68, 1.72, 426.60, 40, 2.05, 433.71, 38, 1.24, 199.07, 31, 3.01, 227.53, 15, 0.83, 639.90, 9, 3.71, 21.34, 6, 2.42, 419.48, 6, 1.16, 647.01, 4, 1.45, 95.98, 4, 2.12, 440.83, 3, 4.09, 110.21, 3, 2.77, 412.37, 3, 3.01, 88.87, 3, 0.00, 853.20, 3, 0.39, 103.09, 2, 3.78, 117.32, 2, 2.83, 234.64, 2, 5.08, 309.28, 2, 2.24, 216.48, 2, 5.19, 302.16, 1, 1.55, 191.96, 1, 3.45, 323.51, 1, 4.83, 210.12, 1, 2.29, 209.37, 1, 0.30, 860.31, 1, 2.38, 632.78, 1, 4.03, 522.58, 1, 4.19, 515.46, 1, 2.17, 124.43,
/*L5*/  124, 2.259, 7.114, 34, 2.16, 14.23, 28, 1.20, 220.41, 6, 1.22, 227.53, 5, 0.24, 433.71, 4, 6.23, 426.60, 3, 2.97, 199.07, 3, 4.29, 206.19, 2, 6.25, 213.30, 1, 5.28, 639.90, 1, 0.24, 440.83, 1, 3.14, 0.00, 1, 5.57, 647.01, 1, 0.69, 302.16, 1, 6.18, 191.96, 1, 4.88, 88.87, 1, 4.78, 419.48,
/*B0*/  4330678, 3.6028443, 213.2990954, 240348, 2.852385, 426.598191, 84746, 0.00000, 0.00000, 34116, 0.57297, 206.18555, 30863, 3.48442, 220.41264, 14734, 2.11847, 639.89729, 9917, 5.7900, 419.4846, 6994, 4.7360, 7.1135, 4808, 5.4331, 316.3919, 4788, 4.9651, 110.2063, 3432, 2.7326, 433.7117, 1506, 6.0130, 103.0928, 1060, 5.6310, 529.6910, 969, 5.204, 632.784, 942, 1.396, 853.196, 708, 3.803, 323.505, 552, 5.131, 202.253, 400, 3.359, 227.526, 319, 3.626, 209.367, 316, 1.997, 647.011, 314, 0.465, 217.231, 284, 4.886, 224.345, 236, 2.139, 11.046, 215, 5.950, 846.083, 209, 2.120, 415.552, 207, 0.730, 199.072, 179, 2.954, 63.736, 141, 0.644, 490.334, 139, 4.595, 14.227, 139, 1.998, 735.877, 135, 5.245, 742.990, 122, 3.115, 522.577, 116, 3.109, 216.480, 114, 0.963, 210.118, 96, 4.48, 117.32, 81, 1.32, 277.03, 74, 2.89, 149.56, 73, 3.06, 536.80, 69, 4.92, 309.28, 68, 2.18, 351.82, 62, 0.68, 1066.50, 57, 2.61, 440.83, 49, 5.79, 95.98, 48, 2.18, 74.78, 38, 5.29, 1059.38, 37, 6.28, 1162.47, 36, 1.63, 628.85, 35, 1.71, 1052.27, 34, 5.98, 412.37, 34, 2.46, 422.67, 34, 1.14, 949.18, 32, 4.15, 437.64, 27, 1.27, 860.31, 24, 3.07, 215.75, 24, 4.11, 3.93, 24, 2.75, 838.97, 23, 0.99, 210.85, 21, 0.14, 430.53, 21, 3.51, 330.62, 20, 2.82, 127.47, 19, 2.98, 137.03, 19, 6.27, 423.42, 18, 2.29, 388.47, 18, 6.20, 703.63, 17, 3.90, 214.26, 17, 0.17, 212.34, 17, 1.67, 38.13, 16, 4.55, 956.29,
/*B1*/  397555, 5.332900, 213.299095, 49479, 3.14159, 0.00000, 18572, 6.09919, 426.59819, 14801, 2.30586, 206.18555, 9644, 1.6967, 220.4126, 3757, 1.2543, 419.4846, 2717, 5.9117, 639.8973, 1455, 0.8516, 433.7117, 1291, 2.9177, 7.1135, 853, 0.436, 316.392, 298, 0.919, 632.784, 292, 5.316, 853.196, 284, 1.619, 227.526, 275, 3.889, 103.093, 172, 0.052, 647.011, 166, 2.444, 199.072, 158, 5.209, 110.206, 128, 1.207, 529.691, 110, 2.457, 217.231, 82, 2.76, 210.12, 81, 2.86, 14.23, 69, 1.66, 202.25, 65, 1.26, 216.48, 61, 1.25, 209.37, 59, 1.82, 323.51, 46, 0.82, 440.83, 36, 1.82, 224.34, 34, 2.84, 117.32, 33, 1.31, 412.37, 32, 1.19, 846.08, 27, 4.65, 1066.50, 27, 4.44, 11.05, 23, 4.13, 415.55, 21, 1.41, 309.28, 18, 5.56, 860.31, 15, 1.22, 63.74, 15, 1.34, 95.98, 15, 1.01, 536.80, 13, 2.46, 490.33, 13, 3.22, 277.03, 13, 2.27, 742.99, 13, 4.89, 522.58, 13, 0.30, 422.67, 12, 1.87, 423.42, 10, 3.12, 625.67, 10, 1.75, 330.62, 9, 0.46, 429.78, 8, 4.68, 215.75, 8, 2.42, 430.53, 7, 5.97, 149.56, 7, 1.52, 437.64, 7, 3.91, 351.82, 7, 3.01, 949.18, 6, 1.49, 234.64, 6, 0.02, 654.12, 6, 5.37, 735.88, 5, 3.81, 74.78, 5, 4.34, 628.85, 4, 5.64, 210.85, 4, 2.64, 3.18, 4, 1.73, 1059.38, 4, 4.99, 3.93, 4, 1.16, 223.59,
/*B2*/  20630, 0.50482, 213.29910, 3720, 3.9983, 206.1855, 1627, 6.1819, 220.4126, 1346, 0.0000, 0.0000, 706, 3.039, 419.485, 365, 5.099, 426.598, 330, 5.279, 433.712, 219, 3.828, 639.897, 139, 1.043, 7.114, 104, 6.157, 227.526, 93, 1.98, 316.39, 71, 4.15, 199.07, 52, 2.88, 632.78, 49, 4.43, 647.01, 41, 3.16, 853.20, 29, 4.53, 210.12, 24, 1.12, 14.23, 21, 4.35, 217.23, 20, 5.31, 440.83, 18, 0.85, 110.21, 17, 5.68, 216.48, 16, 4.26, 103.09, 14, 3.00, 412.37, 12, 2.53, 529.69, 8, 3.32, 202.25, 7, 5.56, 209.37, 7, 0.29, 323.51, 6, 1.16, 117.32, 6, 3.61, 860.31, 6, 3.58, 309.28, 6, 2.48, 1066.50, 4, 3.02, 846.08, 4, 4.80, 625.67, 3, 3.77, 423.42, 3, 6.04, 234.64, 3, 4.82, 429.78, 3, 4.48, 654.12, 3, 3.29, 95.98, 3, 5.64, 735.88, 3, 0.22, 522.58, 2, 0.03, 415.55, 2, 6.25, 330.62, 2, 4.56, 422.67, 2, 5.06, 277.03, 2, 5.53, 536.80, 2, 5.54, 224.34, 2, 5.60, 223.59,
/*B3*/  666, 1.990, 213.299, 632, 5.698, 206.186, 398, 0.000, 0.000, 188, 4.338, 220.413, 92, 4.84, 419.48, 52, 3.42, 433.71, 42, 2.38, 426.60, 26, 4.40, 227.53, 21, 5.85, 199.07, 18, 1.99, 639.90, 11, 5.37, 7.11, 10, 2.55, 647.01, 7, 3.46, 316.39, 6, 4.80, 632.78, 6, 0.02, 210.12, 6, 3.52, 440.83, 5, 5.64, 14.23, 5, 1.22, 853.20, 4, 4.71, 412.37, 3, 0.63, 103.09, 2, 3.72, 216.48, 2, 6.11, 217.23, 1, 1.69, 860.31, 1, 4.31, 234.64, 1, 5.75, 309.28, 1, 2.66, 654.12, 1, 5.69, 117.32, 1, 5.48, 202.25, 1, 0.60, 1066.50, 1, 0.22, 625.67, 1, 2.86, 429.78, 1, 4.52, 323.51,
/*B4*/  80, 1.12, 206.19, 32, 3.12, 213.30, 17, 2.48, 220.41, 12, 3.14, 0.00, 9, 0.38, 419.48, 6, 1.56, 433.71, 5, 2.63, 227.53, 5, 1.28, 199.07, 1, 1.43, 426.60, 1, 0.67, 647.01, 1, 1.72, 440.83, 1, 6.18, 639.90, 1, 3.85, 14.23, 1, 3.49, 7.11, 1, 0.31, 412.37,
/*B5*/  8, 2.82, 206.19, 1, 0.51, 220.41, 1, 3.14, 0.00, 1, 2.99, 199.07, 1, 0.78, 227.53, 1, 5.96, 433.71,
/*R0*/  955758136, 0.000000000, 0.000000000, 52921382, 2.39226220, 213.29909544, 1873680, 5.2354961, 206.1855484, 1464664, 1.6476305, 426.5981909, 821891, 5.935200, 316.391870, 547507, 5.015326, 103.092774, 371684, 2.271148, 220.412642, 361778, 3.139043, 7.113547, 140618, 5.704067, 632.783739, 108975, 3.293136, 110.206321, 69007, 5.94100, 419.48464, 61053, 0.94038, 639.89729, 48913, 1.55733, 202.25340, 34144, 0.19519, 277.03499, 32402, 5.47085, 949.17561, 20937, 0.46349, 735.87651, 20839, 1.52103, 433.71174, 20747, 5.33256, 199.07200, 15298, 3.05944, 529.69097, 14296, 2.60434, 323.50542, 12884, 1.64892, 138.51750, 11993, 5.98051, 846.08283, 11380, 1.73106, 522.57742, 9796, 5.2048, 1265.5675, 7753, 5.8519, 95.9792, 6771, 3.0043, 14.2271, 6466, 0.1773, 1052.2684, 5850, 1.4552, 415.5525, 5307, 0.5974, 63.7359, 4696, 2.1492, 227.5262, 4044, 1.6401, 209.3669, 3688, 0.7802, 412.3711, 3461, 1.8509, 175.1661, 3420, 4.9455, 1581.9593, 3401, 0.5539, 350.3321, 3376, 3.6953, 224.3448, 2976, 5.6847, 210.1177, 2885, 1.3876, 838.9693, 2881, 0.1796, 853.1964, 2508, 3.5385, 742.9901, 2448, 6.1841, 1368.6603, 2406, 2.9656, 117.3199, 2174, 0.0151, 340.7709, 2024, 5.0541, 11.0457, 1888, 0.0297, 3.9322, 1861, 5.9336, 625.6702, 1817, 5.7771, 490.3341, 1781, 0.7631, 217.2312, 1740, 2.3466, 309.2783, 1611, 1.1730, 74.7816, 1475, 5.6767, 203.7379, 1472, 1.4006, 137.0330, 1463, 1.9259, 216.4805, 1395, 5.9367, 127.4718, 1315, 5.1120, 211.8146, 1304, 0.7724, 647.0108, 1296, 4.6918, 1898.3512, 1277, 2.9841, 1059.3819, 1207, 0.7529, 351.8166, 1150, 5.7402, 1162.4747, 1127, 4.4671, 265.9893, 1099, 1.8177, 149.5632, 1071, 1.1357, 1155.3612, 1021, 5.9123, 1685.0521, 998, 2.631, 200.769, 986, 2.260, 956.289, 932, 3.670, 554.070, 664, 0.603, 728.763, 660, 4.666, 195.140, 626, 5.942, 1478.867, 618, 5.621, 942.062, 553, 3.411, 269.921, 534, 1.264, 275.551, 517, 4.443, 2214.743, 494, 2.286, 278.519, 490, 5.806, 191.208, 488, 2.794, 3.181, 482, 1.841, 479.288, 473, 1.882, 515.464, 470, 0.838, 1471.753, 453, 3.003, 302.165, 452, 5.645, 2001.444, 427, 0.057, 284.149, 405, 1.640, 536.805, 386, 1.997, 1272.681, 343, 5.856, 1795.258, 341, 2.376, 525.498, 341, 0.891, 628.852, 340, 1.402, 440.825, 303, 0.879, 6069.777, 295, 0.671, 88.866, 294, 0.426, 312.199, 292, 6.214, 210.851, 288, 1.122, 422.666, 277, 5.319, 692.587, 276, 0.478, 38.133, 262, 0.318, 1045.155, 243, 5.372, 1258.454, 241, 1.125, 388.465, 237, 0.908, 1375.774, 234, 4.228, 114.138, 231, 5.495, 191.958, 226, 0.375, 142.450, 225, 0.548, 1788.145, 224, 2.281, 330.619, 222, 5.946, 39.357, 219, 5.256, 212.336, 214, 4.203, 2531.135, 208, 5.381, 2317.836, 206, 0.958, 288.081, 197, 3.901, 52.690, 192, 2.959, 437.644, 188, 6.079, 563.631, 187, 6.036, 404.507, 183, 5.669, 2111.650, 180, 4.410, 408.439, 178, 0.382, 430.530, 177, 2.303, 9999.986, 175, 5.714, 1066.495, 173, 1.849, 1589.073, 172, 2.365, 213.251, 172, 5.563, 213.347, 170, 2.857, 99.161, 166, 2.637, 215.747, 165, 2.891, 214.262, 163, 3.458, 617.806, 162, 5.731, 203.004, 150, 4.407, 417.037, 146, 1.566, 831.856, 145, 5.082, 423.417, 143, 0.998, 76.266, 137, 5.439, 222.860, 132, 2.859, 312.460, 129, 2.553, 414.068, 125, 4.784, 205.222, 120, 0.043, 1361.547, 113, 5.031, 703.633, 112, 0.262, 2104.537, 110, 2.437, 355.749, 109, 1.632, 208.633, 109, 2.093, 207.670, 109, 2.855, 21.341, 107, 3.671, 212.778, 104, 3.637, 65.220, 99, 5.14, 1574.85, 98, 5.12, 2634.23, 97, 4.20, 305.35, 97, 4.84, 131.40, 97, 2.56, 1692.17, 96, 5.45, 2428.04, 95, 2.52, 2.45, 94, 2.40, 483.22, 93, 0.74, 831.10, 92, 2.95, 35.42, 91, 3.97, 2847.53, 91, 4.21, 213.82, 89, 5.39, 107.02, 89, 4.06, 128.96, 88, 3.87, 140.00, 87, 1.33, 1905.46, 86, 2.30, 85.83, 86, 4.55, 210.38, 86, 0.03, 860.31, 84, 1.18, 429.78, 84, 4.61, 177.87, 83, 1.53, 145.63, 82, 1.66, 62.25, 77, 3.15, 767.37, 74, 3.57, 1.48, 74, 3.72, 92.05, 73, 4.38, 425.11, 73, 4.63, 245.54, 72, 0.01, 565.12, 71, 0.99, 405.26, 70, 4.04, 173.94, 67, 1.08, 339.29, 67, 4.75, 70.85, 66, 2.47, 280.97, 65, 2.45, 267.47, 65, 0.09, 9.56, 64, 1.29, 1148.25, 64, 4.10, 327.44, 63, 2.02, 234.64, 63, 4.40, 214.78, 61, 5.12, 756.32, 59, 4.23, 700.66, 59, 2.62, 225.83, 58, 6.06, 1677.94, 58, 5.47, 347.88, 57, 6.27, 2420.93, 56, 2.07, 124.43, 56, 4.30, 329.73, 55, 1.60, 543.02, 55, 3.86, 342.26, 54, 3.71, 344.70, 54, 1.07, 362.86, 54, 4.98, 134.59, 53, 3.79, 343.22, 50, 5.76, 320.32, 50, 3.93, 192.69, 50, 5.21, 2744.43, 50, 3.23, 333.66, 49, 4.90, 217.49, 49, 5.33, 3127.31, 48, 3.15, 216.22, 48, 2.39, 207.88, 48, 3.93, 199.28, 47, 2.45, 207.15, 47, 2.07, 2008.56, 46, 2.09, 212.55, 46, 4.86, 2950.62, 46, 2.64, 10.29, 46, 4.97, 198.32, 45, 5.36, 218.93, 45, 1.78, 223.59, 45, 5.56, 264.50, 43, 1.84, 106.27, 43, 0.40, 357.45, 42, 0.08, 210.33, 42, 0.74, 125.99, 41, 2.47, 237.68, 41, 4.92, 1891.24, 41, 4.08, 621.74, 40, 4.01, 12.53, 39, 3.46, 241.61, 39, 3.74, 3163.92, 39, 4.40, 18.16, 38, 4.44, 160.61, 38, 2.06, 247.24, 37, 4.75, 348.85, 37, 1.69, 22.09, 36, 3.83, 56.62, 35, 3.44, 273.10, 35, 5.65, 497.45, 35, 5.96, 217.96, 35, 2.25, 487.37, 35, 5.63, 99.91, 35, 1.83, 380.13, 34, 6.01, 166.83, 34, 0.73, 750.10, 34, 5.31, 206.23, 34, 1.24, 2221.86, 34, 5.80, 251.43, 33, 2.45, 969.62, 33, 4.87, 209.11, 33, 1.07, 252.66, 33, 1.93, 98.90, 33, 2.23, 319.57, 32, 3.78, 33.94, 32, 3.58, 231.46, 32, 1.00, 1464.64, 32, 2.13, 206.14, 32, 3.82, 73.30, 31, 2.05, 282.45, 31, 1.96, 244.32, 31, 4.90, 144.15, 31, 2.27, 1169.59, 30, 3.93, 206.71, 29, 5.98, 2737.32, 29, 4.84, 905.89, 29, 2.22, 14.98, 29, 6.03, 188.92, 29, 5.80, 1994.33, 29, 0.04, 5.63, 29, 0.76, 488.85, 29, 1.69, 78.71, 28, 4.73, 552.59, 28, 2.72, 32.24, 28, 0.79, 546.96, 28, 5.18, 5.42, 28, 1.45, 258.88, 28, 6.12, 214.05, 27, 2.45, 254.94, 27, 3.58, 561.18, 27, 0.25, 313.21, 27, 4.26, 179.36, 27, 5.20, 148.08, 27, 5.54, 555.55, 27, 2.86, 24.38, 26, 1.59, 491.82, 26, 0.65, 654.12, 26, 2.10, 248.72, 26, 1.62, 2324.95, 26, 3.36, 0.96, 25, 5.29, 636.72, 25, 4.97, 3060.83, 25, 5.12, 168.05, 25, 1.78, 182.28, 24, 0.01, 69.15, 24, 0.52, 894.84, 24, 3.15, 240.39, 24, 1.60, 738.80, 24, 2.55, 196.62, 23, 3.51, 458.84, 22, 3.25, 681.54, 22, 4.76, 213.19, 22, 3.17, 213.41, 22, 0.88, 635.97, 22, 4.61, 3267.01, 21, 3.86, 116.43, 21, 0.63, 189.72, 21, 1.67, 274.07, 21, 1.07, 494.27, 20, 6.05, 173.68, 20, 1.84, 533.62, 20, 2.95, 59.80, 20, 2.91, 120.36, 20, 4.94, 121.25, 20, 5.59, 4.19, 20, 0.08, 842.15, 20, 2.52, 1485.98, 20, 2.14, 54.17, 19, 0.11, 218.72, 19, 0.55, 4.67, 19, 5.38, 213.09, 19, 2.55, 213.51, 18, 3.19, 295.05, 18, 2.71, 181.81, 18, 2.26, 672.14, 17, 2.90, 477.80, 17, 0.68, 151.05, 17, 0.71, 1781.03, 17, 4.74, 2207.63, 17, 1.63, 5856.48, 17, 3.53, 3480.31, 16, 3.26, 6283.08, 16, 5.39, 424.15, 16, 3.98, 2.92, 16, 0.91, 280.00, 16, 0.63, 358.93, 16, 0.98, 2538.25, 16, 0.60, 746.92, 16, 0.83, 176.65, 16, 4.46, 643.83, 16, 5.23, 135.55, 16, 1.19, 486.40, 16, 5.70, 3053.71, 15, 1.49, 543.92, 15, 5.53, 2310.72, 15, 2.67, 46.47, 15, 1.24, 2641.34, 15, 1.77, 569.05, 15, 2.92, 167.09, 15, 2.66, 292.01, 15, 6.06, 468.24, 15, 5.26, 472.17, 14, 0.22, 235.39, 14, 0.12, 313.68, 14, 0.38, 601.76, 14, 2.63, 618.56, 14, 0.82, 221.38, 14, 3.19, 213.56, 14, 4.73, 213.04, 14, 2.51, 1802.37, 14, 2.21, 228.28,
/*R1*/  6182981, 0.2584352, 213.2990954, 506578, 0.711147, 206.185548, 341394, 5.796358, 426.598191, 188491, 0.472157, 220.412642, 186262, 3.141593, 0.000000, 143891, 1.407449, 7.113547, 49621, 6.01744, 103.09277, 20928, 5.09246, 639.89729, 19953, 1.17560, 419.48464, 18840, 1.60820, 110.20632, 13877, 0.75886, 199.07200, 12893, 5.94330, 433.71174, 5397, 1.2885, 14.2271, 4869, 0.8679, 323.5054, 4247, 0.3930, 227.5262, 3252, 1.2585, 95.9792, 3081, 3.4366, 522.5774, 2909, 4.6068, 202.2534, 2856, 2.1673, 735.8765, 1988, 2.4505, 412.3711, 1941, 6.0239, 209.3669, 1581, 1.2919, 210.1177, 1340, 4.3080, 853.1964, 1316, 1.2530, 117.3199, 1203, 1.8665, 316.3919, 1091, 0.0753, 216.4805, 966, 0.480, 632.784, 954, 5.152, 647.011, 898, 0.983, 529.691, 882, 1.885, 1052.268, 874, 1.402, 224.345, 785, 3.064, 838.969, 740, 1.382, 625.670, 658, 4.144, 309.278, 650, 1.725, 742.990, 613, 3.033, 63.736, 599, 2.549, 217.231, 503, 2.130, 3.932, 413, 4.593, 415.552, 395, 0.533, 956.289, 363, 4.707, 302.165, 356, 2.303, 728.763, 345, 5.888, 440.825, 336, 1.616, 1368.660, 322, 0.979, 3.181, 317, 3.584, 515.464, 294, 2.816, 11.046, 291, 2.831, 1155.361, 278, 0.260, 195.140, 265, 2.427, 88.866, 265, 5.829, 149.563, 264, 1.285, 1059.382, 246, 0.907, 191.958, 245, 1.045, 942.062, 222, 5.132, 269.921, 215, 3.565, 490.334, 195, 4.567, 846.083, 183, 2.679, 127.472, 182, 4.934, 74.782, 175, 3.446, 137.033, 170, 4.635, 284.149, 166, 5.998, 536.805, 158, 2.996, 340.771, 155, 1.197, 265.989, 153, 0.270, 1272.681, 152, 5.439, 422.666, 152, 0.529, 330.619, 141, 1.271, 203.004, 141, 2.021, 1045.155, 140, 1.353, 1685.052, 136, 5.017, 351.817, 129, 1.143, 21.341, 128, 2.539, 1471.753, 127, 3.003, 277.035, 108, 4.319, 210.851, 103, 0.382, 203.738, 100, 3.614, 1066.495, 98, 2.56, 191.21, 97, 3.26, 831.86, 96, 0.79, 1258.45, 83, 0.28, 234.64, 73, 0.63, 1375.77, 72, 4.38, 860.31, 72, 5.58, 429.78, 71, 0.73, 437.64, 70, 0.88, 423.42, 69, 2.47, 949.18, 67, 5.45, 200.77, 67, 0.07, 408.44, 66, 2.68, 405.26, 66, 0.06, 1589.07, 64, 1.75, 1361.55, 62, 1.09, 2001.44, 60, 2.25, 1788.14, 55, 4.59, 628.85, 54, 0.28, 124.43, 51, 6.27, 223.59, 50, 3.80, 215.75, 49, 4.17, 138.52, 48, 0.84, 10.29, 47, 2.17, 312.20, 43, 3.38, 208.63, 43, 2.99, 1148.25, 42, 4.83, 288.08, 40, 5.18, 1478.87, 40, 0.28, 131.40, 39, 0.56, 1574.85, 37, 0.63, 52.69, 35, 4.68, 38.13, 33, 1.98, 142.45, 33, 3.28, 222.86, 33, 6.12, 145.63, 32, 5.19, 76.27, 32, 6.02, 1905.46, 31, 1.48, 1677.94, 30, 1.96, 2104.54, 29, 5.10, 654.12, 29, 4.96, 1795.26, 29, 2.75, 404.51, 28, 0.83, 1692.17, 28, 0.83, 2317.84, 28, 2.24, 430.53, 27, 5.24, 388.47, 27, 1.00, 107.02, 26, 4.28, 483.22, 26, 2.21, 1265.57, 25, 2.87, 703.63, 25, 6.24, 106.27, 25, 1.08, 99.91, 25, 0.81, 312.46, 24, 3.11, 212.34, 24, 0.55, 214.26, 24, 0.65, 207.88, 23, 5.08, 479.29, 23, 4.87, 295.05, 22, 4.23, 217.96, 22, 5.51, 343.22, 22, 3.90, 563.63, 22, 0.73, 99.16, 22, 6.07, 85.83, 22, 4.17, 2.45, 22, 3.80, 347.88, 21, 3.09, 554.07, 21, 0.39, 319.57, 21, 5.11, 333.66, 21, 2.69, 1464.64, 21, 3.29, 70.85, 21, 5.12, 362.86, 21, 1.69, 231.46, 21, 2.46, 18.16, 20, 0.23, 213.25, 20, 5.08, 750.10, 20, 3.43, 213.35, 19, 2.02, 313.21, 19, 0.05, 245.54, 18, 5.70, 56.62, 18, 3.84, 497.45, 17, 3.55, 218.93, 17, 4.72, 2111.65, 17, 1.41, 114.14, 16, 3.05, 134.59, 16, 1.71, 2420.93, 16, 4.94, 357.45, 16, 4.22, 565.12, 16, 0.27, 225.83, 16, 0.33, 1891.24, 16, 2.83, 81.75, 15, 1.21, 1994.33, 15, 1.31, 216.22, 15, 3.85, 1162.47, 15, 5.57, 344.70, 14, 0.45, 2008.56, 14, 5.71, 92.05, 14, 0.57, 2634.23, 13, 5.76, 2221.86, 13, 0.45, 1169.59, 13, 1.60, 320.32, 13, 3.74, 508.35, 13, 3.43, 258.88, 13, 1.64, 273.10, 13, 1.92, 1581.96, 13, 5.19, 635.97, 12, 1.01, 329.73, 12, 5.95, 543.92, 12, 4.45, 32.24, 12, 5.11, 4.67, 12, 4.31, 618.56, 12, 2.46, 721.65, 12, 1.76, 160.61, 12, 3.71, 350.33, 12, 2.80, 217.49, 11, 3.00, 198.32, 11, 1.89, 561.18, 11, 2.41, 1781.03, 11, 1.58, 212.78, 11, 0.77, 218.72, 11, 2.07, 213.82, 10, 2.41, 546.96, 10, 0.09, 182.28, 10, 0.49, 305.35, 10, 2.64, 416.30, 10, 4.05, 62.25, 10, 3.28, 275.55, 10, 1.61, 327.44, 10, 1.10, 113.39, 9, 5.46, 414.07, 9, 4.46, 2428.04, 9, 2.92, 1279.79, 9, 4.88, 120.36, 9, 0.54, 168.05, 9, 6.14, 621.74, 9, 1.83, 629.60, 9, 1.95, 35.42, 9, 2.18, 425.11, 8, 0.36, 617.81, 8, 3.77, 251.43, 8, 0.92, 1485.98, 8, 1.38, 1.48, 8, 5.31, 65.22, 8, 3.46, 424.15, 8, 0.35, 278.52, 8, 5.44, 254.94, 8, 0.96, 767.37, 8, 1.43, 2737.32, 8, 3.38, 144.15, 8, 0.94, 636.72, 8, 5.14, 22.09, 8, 0.94, 2310.72, 8, 5.14, 358.93, 8, 4.56, 280.97, 8, 0.10, 2324.95, 8, 5.75, 447.94, 8, 2.19, 264.50, 7, 4.52, 5.63, 7, 3.85, 214.05, 7, 3.39, 98.90, 7, 1.20, 5.42, 7, 1.65, 1898.35, 7, 1.79, 12.53, 7, 3.50, 9.56, 6, 5.31, 6076.89, 6, 0.45, 10007.10, 6, 0.33, 2950.62, 6, 2.12, 274.07, 6, 0.76, 210.38, 6, 3.21, 219.45, 6, 3.80, 339.29, 6, 4.59, 207.67, 6, 0.18, 2207.63, 6, 2.11, 2097.42, 6, 4.67, 543.02, 6, 5.13, 692.59, 6, 6.17, 650.94, 6, 5.95, 486.40, 6, 1.04, 9992.87, 6, 6.10, 209.11, 6, 5.48, 2538.25, 6, 3.01, 121.25, 6, 5.92, 6062.66, 6, 3.56, 1073.61, 6, 0.56, 116.43, 6, 4.40, 196.62, 6, 4.83, 643.08, 6, 0.95, 1802.37, 6, 0.81, 472.17, 6, 2.24, 1038.04, 6, 3.61, 125.99, 6, 3.84, 181.06, 5, 5.81, 237.68, 5, 6.19, 337.73, 5, 0.56, 192.69, 5, 3.82, 842.15, 5, 4.85, 267.47, 5, 0.50, 248.72, 5, 4.01, 205.22, 5, 3.36, 824.74, 5, 1.63, 166.83, 5, 0.85, 46.47, 5, 4.04, 487.37, 5, 0.85, 247.24, 5, 4.49, 291.26, 5, 2.67, 417.04, 5, 0.25, 129.92, 5, 4.18, 2744.43, 5, 3.74, 235.39, 5, 5.58, 342.26, 5, 1.55, 214.78, 5, 3.17, 148.08, 5, 3.67, 189.72, 4, 4.71, 151.05, 4, 3.74, 699.70, 4, 0.25, 128.96, 4, 5.69, 252.66, 4, 4.95, 184.09, 4, 5.43, 436.89, 4, 6.20, 268.44, 4, 4.19, 685.47, 4, 2.98, 380.13, 4, 5.97, 212.55, 4, 6.10, 2641.34, 4, 5.82, 491.82, 4, 4.87, 14.98, 4, 4.19, 501.38, 4, 1.15, 3053.71, 4, 3.08, 710.75, 4, 5.17, 114.40, 4, 3.46, 220.46, 4, 0.75, 2627.11, 4, 0.99, 271.41, 4, 4.78, 175.17, 4, 3.71, 204.70, 4, 1.27, 211.81, 4, 3.56, 244.32, 4, 4.53, 488.85, 4, 2.87, 411.62, 4, 2.22, 2.92, 4, 3.06, 409.92, 4, 5.54, 458.84, 4, 1.58, 643.83, 4, 4.51, 601.76, 4, 1.11, 6283.08, 4, 2.20, 135.34, 4, 3.64, 229.97, 4, 1.32, 69.15,
/*R2*/  436902, 4.786717, 213.299095, 71923, 2.50070, 206.18555, 49767, 4.97168, 220.41264, 43221, 3.86940, 426.59819, 29646, 5.96310, 7.11355, 4721, 2.4753, 199.0720, 4142, 4.1067, 433.7117, 3789, 3.0977, 639.8973, 2964, 1.3721, 103.0928, 2556, 2.8507, 419.4846, 2327, 0.0000, 0.0000, 2208, 6.2759, 110.2063, 2188, 5.8555, 14.2271, 1957, 4.9245, 227.5262, 924, 5.464, 323.505, 706, 2.971, 95.979, 546, 4.129, 412.371, 431, 5.178, 522.577, 405, 4.173, 209.367, 391, 4.481, 216.480, 374, 5.834, 117.320, 361, 3.277, 647.011, 356, 3.192, 210.118, 326, 2.269, 853.196, 207, 4.022, 735.877, 204, 0.088, 202.253, 180, 3.597, 632.784, 178, 4.097, 440.825, 154, 3.135, 625.670, 148, 0.136, 302.165, 133, 2.594, 191.958, 132, 5.933, 309.278, 123, 4.189, 88.866, 119, 5.554, 224.345, 111, 4.779, 838.969, 109, 5.293, 515.464, 100, 5.461, 3.181, 97, 4.02, 728.76, 96, 6.26, 742.99, 94, 4.38, 217.23, 81, 5.11, 956.29, 79, 5.73, 21.34, 69, 4.05, 3.93, 65, 3.78, 1052.27, 64, 5.81, 529.69, 63, 2.18, 195.14, 57, 3.15, 203.00, 56, 4.84, 234.64, 53, 5.08, 330.62, 53, 3.93, 949.18, 51, 2.77, 942.06, 45, 0.56, 269.92, 42, 4.79, 63.74, 41, 3.73, 316.39, 41, 4.58, 1155.36, 39, 3.51, 422.67, 38, 3.74, 1045.15, 38, 4.19, 536.80, 35, 2.91, 284.15, 35, 5.94, 1059.38, 34, 3.80, 149.56, 33, 4.97, 831.86, 31, 4.84, 1272.68, 30, 2.48, 860.31, 30, 4.35, 405.26, 30, 3.66, 429.78, 30, 1.59, 1066.50, 27, 1.66, 277.03, 26, 4.45, 223.59, 26, 4.82, 124.43, 26, 3.55, 1368.66, 24, 5.31, 10.29, 22, 2.76, 415.55, 22, 1.04, 11.05, 21, 3.62, 1265.57, 20, 2.52, 1258.45, 18, 4.31, 1471.75, 17, 3.49, 1361.55, 17, 3.28, 654.12, 16, 1.73, 490.33, 15, 5.01, 127.47, 15, 3.60, 265.99, 14, 4.69, 1148.25, 14, 3.05, 423.42, 13, 1.90, 408.44, 13, 0.32, 295.05, 13, 4.89, 437.64, 13, 4.62, 1589.07, 13, 3.14, 74.78, 12, 2.33, 210.85, 11, 5.48, 1375.77, 11, 4.55, 81.75, 11, 5.05, 191.21, 11, 5.03, 137.03, 10, 3.34, 1685.05, 10, 5.20, 340.77, 10, 3.17, 351.82, 9, 3.40, 1581.96, 9, 2.81, 99.91, 8, 3.23, 1677.94, 8, 4.04, 1788.14, 8, 2.36, 1574.85, 8, 6.08, 231.46, 8, 3.68, 846.08, 8, 3.29, 750.10, 7, 2.00, 131.40, 7, 4.38, 1464.64, 7, 4.83, 319.57, 7, 4.37, 145.63, 7, 5.43, 508.35, 7, 3.78, 313.21, 6, 1.34, 215.75, 6, 4.00, 447.94, 6, 4.56, 106.27, 6, 2.85, 138.52, 6, 0.55, 18.16, 6, 4.14, 543.92, 6, 4.35, 1905.46, 6, 1.13, 56.62, 5, 4.20, 721.65, 5, 3.63, 6076.89, 5, 4.50, 416.30, 5, 2.64, 288.08, 5, 5.05, 10007.10, 5, 2.45, 628.85, 5, 3.12, 1898.35, 5, 6.18, 483.22, 5, 5.92, 618.56, 5, 3.30, 76.27, 5, 3.12, 2001.44, 5, 5.78, 184.84, 5, 0.76, 333.66, 5, 1.27, 6062.66, 5, 1.20, 200.77, 5, 2.69, 9992.87, 5, 0.95, 343.22, 4, 0.80, 222.86, 4, 1.92, 497.45, 4, 2.90, 107.02, 4, 1.98, 347.88, 4, 2.88, 38.13, 4, 2.93, 1994.33, 4, 5.18, 404.51, 4, 5.45, 1692.17, 4, 4.12, 1781.03, 4, 3.12, 635.97, 4, 0.88, 703.63, 4, 3.79, 2104.54, 4, 3.25, 362.86, 4, 0.05, 32.24, 4, 3.48, 388.47, 4, 5.55, 113.39, 4, 5.46, 6283.08, 4, 4.08, 430.53, 3, 1.82, 70.85, 3, 3.52, 629.60, 3, 0.55, 10213.29, 3, 4.21, 337.73, 3, 3.28, 357.45, 3, 1.98, 203.74, 3, 3.88, 85.83, 3, 3.92, 1038.04, 3, 2.46, 867.42, 3, 1.26, 134.59, 3, 1.61, 1073.61, 3, 4.09, 1478.87, 3, 2.18, 1891.24, 3, 2.67, 52.69, 3, 0.41, 561.18, 3, 5.60, 216.22, 3, 5.01, 312.46, 3, 2.55, 6069.78, 3, 5.46, 258.88, 3, 2.19, 217.96, 3, 3.97, 9999.99, 3, 0.89, 1279.79, 3, 4.21, 650.94, 3, 1.67, 213.35, 3, 2.38, 181.06, 3, 3.91, 312.20, 3, 4.75, 213.25, 3, 5.09, 1169.59, 3, 5.74, 160.61, 3, 2.88, 643.08, 3, 3.62, 436.89, 3, 0.01, 195.89, 3, 1.69, 208.63, 3, 2.32, 565.12, 3, 1.13, 344.70, 3, 6.13, 273.10, 3, 5.10, 824.74, 3, 5.30, 444.76, 2, 3.58, 2420.93, 2, 2.96, 2214.74, 2, 3.46, 6275.96, 2, 4.74, 218.72, 2, 0.90, 121.25, 2, 4.08, 131.55, 2, 2.60, 305.35, 2, 4.22, 2221.86, 2, 5.18, 99.16, 2, 5.43, 207.88, 2, 3.38, 22.09, 2, 3.32, 358.93, 2, 3.95, 1795.26, 2, 1.61, 218.93, 2, 3.37, 320.32, 2, 4.85, 1141.13, 2, 4.63, 188.03, 2, 2.29, 2627.11, 2, 5.67, 28.45, 2, 1.69, 350.33, 2, 4.26, 546.96, 2, 0.18, 12.53, 2, 4.61, 182.28, 2, 2.90, 2310.72, 2, 1.31, 212.34, 2, 4.13, 225.83, 2, 3.01, 2317.84, 2, 1.59, 424.15, 2, 3.58, 329.73, 2, 2.24, 168.05, 2, 2.07, 144.15, 2, 2.86, 636.72, 2, 5.35, 45.58, 2, 5.05, 214.26, 2, 2.73, 291.26, 2, 2.70, 12.74, 2, 1.32, 219.45, 2, 5.56, 92.80, 2, 1.95, 129.92, 2, 3.44, 2428.04, 2, 3.55, 1354.43, 2, 4.98, 2008.56, 2, 6.14, 554.07, 2, 3.30, 1670.83, 2, 5.73, 1485.98, 2, 1.16, 235.39, 2, 4.51, 210.38, 2, 2.16, 207.67, 2, 5.51, 204.70, 2, 4.99, 1162.47,
/*R3*/  20315, 3.02187, 213.29910, 8924, 3.1914, 220.4126, 6909, 4.3517, 206.1855, 4087, 4.2241, 7.1135, 3879, 2.0106, 426.5982, 1071, 4.2036, 199.0720, 907, 2.283, 433.712, 606, 3.175, 227.526, 597, 4.135, 14.227, 483, 1.173, 639.897, 393, 0.000, 0.000, 229, 4.698, 419.485, 188, 4.590, 110.206, 150, 3.202, 103.093, 121, 3.768, 323.505, 102, 4.710, 95.979, 101, 5.819, 412.371, 93, 1.44, 647.01, 84, 2.63, 216.48, 73, 4.15, 117.32, 62, 2.31, 440.83, 55, 0.31, 853.20, 50, 2.39, 209.37, 45, 4.37, 191.96, 41, 0.69, 522.58, 40, 1.84, 302.16, 38, 5.94, 88.87, 32, 4.01, 21.34, 28, 5.77, 210.12, 25, 0.73, 515.46, 25, 3.06, 234.64, 21, 4.93, 625.67, 18, 1.46, 309.28, 17, 5.73, 728.76, 17, 3.53, 3.18, 13, 3.36, 330.62, 12, 5.99, 735.88, 11, 3.37, 224.34, 11, 3.42, 956.29, 11, 6.07, 405.26, 10, 0.28, 838.97, 10, 0.58, 860.31, 10, 1.59, 202.25, 9, 2.57, 223.59, 9, 2.94, 124.43, 9, 4.65, 632.78, 9, 1.76, 429.78, 8, 4.48, 742.99, 8, 4.20, 195.14, 8, 0.44, 831.86, 8, 1.46, 654.12, 7, 4.51, 942.06, 7, 5.47, 1045.15, 7, 1.52, 422.67, 7, 4.83, 316.39, 7, 3.42, 10.29, 6, 6.01, 1066.50, 6, 2.34, 269.92, 6, 0.83, 217.23, 6, 1.15, 284.15, 6, 4.18, 529.69, 6, 2.47, 536.80, 5, 2.12, 295.05, 4, 0.92, 203.00, 4, 3.23, 1272.68, 4, 0.11, 1155.36, 4, 6.01, 1052.27, 4, 0.06, 81.75, 3, 4.33, 1258.45, 3, 0.19, 1148.25, 3, 2.19, 447.94, 3, 1.89, 149.56, 3, 5.64, 3.93, 3, 5.41, 1361.55, 3, 4.97, 1677.94, 3, 0.92, 508.35, 3, 3.00, 1589.07, 3, 2.31, 543.92, 3, 3.71, 408.44, 2, 4.24, 1059.38, 2, 3.22, 319.57, 2, 5.73, 313.21, 2, 1.30, 184.84, 2, 5.88, 721.65, 2, 0.52, 416.30, 2, 6.18, 1464.64, 2, 6.23, 1471.75, 2, 2.41, 337.73, 2, 5.17, 2854.64, 2, 2.41, 131.55, 2, 5.62, 11.05, 2, 0.54, 635.97, 2, 5.59, 1038.04, 2, 1.82, 436.89, 2, 1.51, 750.10, 2, 6.12, 1073.61, 2, 4.58, 1994.33, 2, 0.03, 423.42, 2, 2.58, 2090.31, 2, 2.95, 437.64, 2, 1.75, 195.89, 2, 5.97, 1781.03, 2, 0.56, 2324.95, 2, 6.15, 490.33, 2, 0.61, 210.85, 2, 3.85, 1251.34, 1, 0.27, 497.45, 1, 0.99, 643.08, 1, 5.35, 1354.43, 1, 3.29, 1884.12, 1, 1.50, 430.53, 1, 0.85, 415.55, 1, 5.33, 2538.25, 1, 4.12, 1574.85, 1, 5.58, 1382.89, 1, 0.70, 867.42, 1, 3.79, 1567.73, 1, 2.29, 2420.93, 1, 1.41, 2634.23, 1, 0.48, 824.74, 1, 2.97, 241.75, 1, 3.11, 2200.52, 1, 5.13, 25.27, 1, 4.70, 113.39, 1, 1.80, 618.56, 1, 3.96, 1891.24, 1, 3.78, 1375.77, 1, 3.73, 131.40, 1, 4.48, 2214.74, 1, 0.79, 127.47, 1, 5.42, 1279.79, 1, 0.05, 63.74, 1, 4.80, 1987.22, 1, 5.85, 215.75, 1, 4.06, 231.46, 1, 1.09, 362.86, 1, 4.23, 1802.37, 1, 5.33, 2428.04, 1, 5.91, 265.99, 1, 0.74, 16.67, 1, 6.26, 2015.67, 1, 5.99, 2524.02, 1, 1.92, 483.22, 1, 2.66, 145.63, 1, 2.97, 934.95, 1, 6.26, 2.45, 1, 3.16, 2207.63, 1, 0.09, 628.85, 1, 1.24, 74.78, 1, 5.87, 1368.66, 1, 2.90, 2008.56, 1, 2.38, 2228.97, 1, 2.28, 1478.87, 1, 1.16, 3053.71, 1, 4.70, 1670.83, 1, 5.92, 1685.05, 1, 3.13, 56.62,
/*R4*/  1202, 1.4150, 220.4126, 708, 1.162, 213.299, 516, 6.240, 206.186, 427, 2.469, 7.114, 268, 0.187, 426.598, 170, 5.959, 199.072, 150, 0.480, 433.712, 145, 1.442, 227.526, 121, 2.405, 14.227, 47, 5.57, 639.90, 19, 5.86, 647.01, 17, 0.53, 440.83, 16, 2.90, 110.21, 15, 0.30, 419.48, 14, 1.30, 412.37, 13, 2.09, 323.51, 11, 0.22, 95.98, 11, 2.46, 117.32, 10, 3.14, 0.00, 9, 1.56, 88.87, 9, 2.28, 21.34, 9, 0.68, 216.48, 8, 1.27, 234.64, 8, 4.49, 853.20, 8, 3.59, 302.16, 6, 5.17, 103.09, 5, 2.59, 515.46, 4, 4.97, 860.31, 4, 0.02, 191.96, 4, 5.97, 654.12, 4, 1.60, 330.62, 4, 1.60, 405.26, 4, 3.30, 210.12, 3, 2.73, 522.58, 3, 0.75, 209.37, 3, 1.32, 728.76, 2, 1.19, 124.43, 2, 0.49, 447.94, 2, 3.28, 203.00, 2, 0.73, 625.67, 2, 6.15, 429.78, 2, 0.75, 295.05, 2, 3.89, 1066.50, 2, 2.00, 831.86, 2, 0.09, 942.06, 2, 0.82, 223.59, 2, 1.40, 224.34, 2, 3.02, 184.84, 2, 5.41, 824.74, 2, 5.96, 422.67, 1, 2.12, 529.69, 1, 0.72, 536.80, 1, 1.65, 17.41, 1, 1.90, 956.29, 1, 5.97, 195.14, 1, 1.12, 838.97, 1, 0.89, 721.65, 1, 1.59, 735.88, 1, 3.06, 1574.85, 1, 1.01, 1045.15, 1, 5.36, 316.39, 1, 4.93, 56.62, 1, 2.72, 508.35, 1, 1.11, 1169.59,
/*R5*/  129, 5.913, 220.413, 32, 0.69, 7.11, 27, 5.91, 227.53, 20, 4.95, 433.71, 20, 0.67, 14.23, 14, 2.67, 206.19, 14, 1.46, 199.07, 13, 4.59, 426.60, 7, 4.63, 213.30, 5, 3.61, 639.90, 4, 4.90, 440.83, 3, 4.07, 647.01, 3, 4.66, 191.96, 3, 0.49, 323.51, 3, 3.18, 419.48, 2, 3.70, 88.87, 2, 3.32, 95.98, 2, 0.56, 117.32, 2, 5.33, 302.16, 2, 0.00, 0.00, 2, 2.67, 853.20, 2, 0.86, 515.46, 1, 5.83, 234.64, 1, 0.16, 412.37, 1, 5.98, 3.18, 1, 5.23, 216.48, 1, 5.05, 124.43, 1, 0.37, 28.45),


  //Dura精度:J2000+-4千年 黄经1角秒 黄纬1角秒 距离20AU/10^6
  new Array(
    100000000,//A的倍率
    20, 539, 836, 980, 1070, 1085, 1088, 1193, 1271, 1307, 1322, 1325, 1325, 2150, 2660, 2936, 3089, 3122, 3122,//位置索引表
/*L0*/  548129294, 0.000000000, 0.000000000, 9260408, 0.8910642, 74.7815986, 1504248, 3.6271926, 1.4844727, 365982, 1.899622, 73.297126, 272328, 3.358237, 149.563197, 70328, 5.39254, 63.73590, 68893, 6.09292, 76.26607, 61999, 2.26952, 2.96895, 61951, 2.85099, 11.04570, 26469, 3.14152, 71.81265, 25711, 6.11380, 454.90937, 21079, 4.36059, 148.07872, 17819, 1.74437, 36.64856, 14613, 4.73732, 3.93215, 11163, 5.82682, 224.34480, 10998, 0.48865, 138.51750, 9527, 2.9552, 35.1641, 7546, 5.2363, 109.9457, 4220, 3.2333, 70.8494, 4052, 2.2775, 151.0477, 3490, 5.4831, 146.5943, 3355, 1.0655, 4.4534, 3144, 4.7520, 77.7505, 2927, 4.6290, 9.5612, 2922, 5.3524, 85.8273, 2273, 4.3660, 70.3282, 2149, 0.6075, 38.1330, 2051, 1.5177, 0.1119, 1992, 4.9244, 277.0350, 1667, 3.6274, 380.1278, 1533, 2.5859, 52.6902, 1376, 2.0428, 65.2204, 1372, 4.1964, 111.4302, 1284, 3.1135, 202.2534, 1282, 0.5427, 222.8603, 1244, 0.9161, 2.4477, 1221, 0.1990, 108.4612, 1151, 4.1790, 33.6796, 1150, 0.9334, 3.1814, 1090, 1.7750, 12.5302, 1072, 0.2356, 62.2514, 946, 1.192, 127.472, 708, 5.183, 213.299, 653, 0.966, 78.714, 628, 0.182, 984.600, 607, 5.432, 529.691, 559, 3.358, 0.521, 524, 2.013, 299.126, 483, 2.106, 0.963, 471, 1.407, 184.727, 467, 0.415, 145.110, 434, 5.521, 183.243, 405, 5.987, 8.077, 399, 0.338, 415.552, 396, 5.870, 351.817, 379, 2.350, 56.622, 310, 5.833, 145.631, 300, 5.644, 22.091, 294, 5.839, 39.618, 252, 1.637, 221.376, 249, 4.746, 225.829, 239, 2.350, 137.033, 224, 0.516, 84.343, 223, 2.843, 0.261, 220, 1.922, 67.668, 217, 6.142, 5.938, 216, 4.778, 340.771, 208, 5.580, 68.844, 202, 1.297, 0.048, 199, 0.956, 152.532, 194, 1.888, 456.394, 193, 0.916, 453.425, 187, 1.319, 0.160, 182, 3.536, 79.235, 173, 1.539, 160.609, 172, 5.680, 219.891, 170, 3.677, 5.417, 169, 5.879, 18.159, 165, 1.424, 106.977, 163, 3.050, 112.915, 158, 0.738, 54.175, 147, 1.263, 59.804, 143, 1.300, 35.425, 139, 5.386, 32.195, 139, 4.260, 909.819, 124, 1.374, 7.114, 110, 2.027, 554.070, 109, 5.706, 77.963, 104, 5.028, 0.751, 104, 1.458, 24.379, 103, 0.681, 14.978, 95, 0.91, 74.67, 94, 3.94, 74.89, 89, 0.52, 181.76, 86, 1.71, 82.86, 85, 5.89, 256.54, 85, 0.37, 186.21, 83, 2.93, 265.99, 80, 3.01, 297.64, 80, 1.01, 6.59, 77, 4.59, 6.22, 75, 4.63, 69.36, 74, 6.24, 447.80, 73, 4.28, 87.31, 73, 2.85, 462.02, 70, 1.19, 66.70, 70, 0.87, 305.35, 70, 3.76, 131.40, 69, 4.44, 39.36, 62, 0.17, 479.29, 62, 3.19, 77.23, 58, 1.59, 60.77, 58, 2.67, 381.61, 58, 3.67, 51.21, 57, 1.63, 143.63, 55, 1.50, 71.60, 54, 5.52, 128.96, 50, 1.12, 20.61, 46, 4.36, 75.74, 45, 0.48, 14.01, 42, 3.82, 81.00, 40, 4.57, 46.21, 40, 0.70, 218.41, 40, 6.06, 293.19, 39, 5.59, 99.16, 39, 3.44, 153.50, 38, 6.07, 211.81, 36, 1.67, 258.02, 35, 1.97, 835.04, 35, 3.72, 692.59, 35, 1.03, 203.74, 35, 0.39, 1.37, 34, 1.08, 191.21, 34, 2.94, 140.00, 34, 6.06, 275.55, 33, 4.22, 200.77, 32, 5.51, 72.33, 30, 1.89, 269.92, 30, 3.87, 259.51, 29, 0.17, 528.21, 28, 2.18, 125.99, 27, 2.10, 209.37, 27, 4.75, 41.10, 27, 6.28, 28.57, 27, 4.48, 373.91, 26, 4.77, 284.15, 26, 5.81, 75.30, 26, 6.20, 134.59, 26, 3.63, 490.33, 26, 0.54, 41.64, 26, 0.75, 278.52, 25, 5.43, 116.43, 25, 4.71, 378.64, 24, 3.19, 81.37, 23, 3.58, 1.60, 23, 0.93, 288.08, 23, 0.53, 1514.29, 22, 1.84, 617.81, 22, 4.59, 404.51, 22, 5.87, 45.58, 22, 0.06, 173.94, 21, 2.74, 28.31, 21, 1.98, 114.40, 21, 5.62, 55.66, 21, 2.64, 105.49, 21, 0.89, 255.06, 20, 0.10, 195.14, 20, 3.78, 135.55, 19, 1.49, 0.89, 19, 6.22, 329.84, 19, 2.84, 159.12, 19, 0.51, 67.36, 19, 2.30, 5.11,
/*L1*/  7502543122, 0.0000000000, 0.0000000000, 154458, 5.242017, 74.781599, 24456, 1.71256, 1.48447, 9258, 0.4284, 11.0457, 8266, 1.5022, 63.7359, 7842, 1.3198, 149.5632, 3899, 0.4648, 3.9322, 2284, 4.1737, 76.2661, 1927, 0.5301, 2.9689, 1233, 1.5863, 70.8494, 791, 5.436, 3.181, 767, 1.996, 73.297, 482, 2.984, 85.827, 450, 4.138, 138.517, 446, 3.723, 224.345, 427, 4.731, 71.813, 354, 2.583, 148.079, 348, 2.454, 9.561, 317, 5.579, 52.690, 206, 2.363, 2.448, 189, 4.202, 56.622, 184, 0.284, 151.048, 180, 5.684, 12.530, 171, 3.001, 78.714, 158, 2.909, 0.963, 155, 5.591, 4.453, 154, 4.652, 35.164, 152, 2.942, 77.751, 143, 2.590, 62.251, 121, 4.148, 127.472, 116, 3.732, 65.220, 102, 4.188, 145.631, 102, 6.034, 0.112, 88, 3.99, 18.16, 88, 6.16, 202.25, 81, 2.64, 22.09, 72, 6.05, 70.33, 69, 4.05, 77.96, 59, 3.70, 67.67, 47, 3.54, 351.82, 44, 5.91, 7.11, 43, 5.72, 5.42, 39, 4.92, 222.86, 36, 5.90, 33.68, 36, 3.29, 8.08, 36, 3.33, 71.60, 35, 5.08, 38.13, 31, 5.62, 984.60, 31, 5.50, 59.80, 31, 5.46, 160.61, 30, 1.66, 447.80, 29, 1.15, 462.02, 29, 4.52, 84.34, 27, 5.54, 131.40, 27, 6.15, 299.13, 26, 4.99, 137.03, 25, 5.74, 380.13, 23, 2.25, 111.43, 22, 0.93, 213.30, 22, 2.81, 69.36, 19, 1.86, 108.46, 19, 3.56, 54.17, 16, 3.10, 14.98, 14, 1.54, 340.77, 14, 2.69, 225.83, 14, 4.38, 5.94, 13, 1.95, 87.31, 13, 5.88, 6.22, 12, 0.33, 51.21, 12, 3.60, 269.92, 12, 5.34, 152.53, 12, 0.33, 35.42, 12, 1.75, 79.24, 11, 3.38, 72.33, 11, 1.69, 45.58, 11, 5.97, 265.99, 11, 3.07, 284.15, 10, 4.17, 24.38, 10, 3.52, 529.69, 10, 4.65, 77.23, 10, 5.50, 153.50, 10, 1.01, 68.84, 10, 0.50, 209.37, 10, 5.60, 82.86, 9, 3.54, 41.64, 9, 3.93, 39.62, 9, 4.49, 20.61, 9, 1.97, 195.14, 9, 3.89, 60.77, 8, 4.41, 134.59, 8, 2.44, 146.59, 8, 5.73, 184.73, 8, 0.17, 120.36, 8, 5.36, 75.74, 8, 5.77, 73.82, 8, 4.44, 14.01, 7, 2.19, 145.11, 7, 4.12, 191.21, 7, 2.13, 116.43,
/*L2*/  53033, 0.00000, 0.00000, 2358, 2.2601, 74.7816, 769, 4.526, 11.046, 552, 3.258, 63.736, 542, 2.276, 3.932, 529, 4.923, 1.484, 258, 3.691, 3.181, 239, 5.858, 149.563, 182, 6.218, 70.849, 54, 1.44, 76.27, 49, 6.03, 56.62, 45, 3.91, 2.45, 45, 0.81, 85.83, 38, 1.78, 52.69, 37, 4.46, 2.97, 33, 0.86, 9.56, 29, 5.10, 73.30, 24, 2.11, 18.16, 22, 5.99, 138.52, 22, 4.82, 78.71, 21, 2.40, 77.96, 21, 2.17, 224.34, 17, 2.54, 145.63, 17, 3.47, 12.53, 12, 0.02, 22.09, 11, 0.08, 127.47, 10, 5.16, 71.60, 10, 4.46, 62.25, 9, 4.26, 7.11, 8, 5.50, 67.67, 7, 1.25, 5.42, 6, 3.36, 447.80, 6, 5.45, 65.22, 6, 4.52, 151.05, 6, 5.73, 462.02, 6, 5.61, 148.08, 6, 1.83, 202.25, 5, 1.06, 131.40, 5, 3.52, 59.80, 5, 3.36, 4.45, 5, 1.20, 71.81, 4, 0.68, 77.75, 4, 1.76, 351.82, 4, 4.57, 454.91, 3, 3.84, 45.58, 3, 3.32, 160.61, 3, 6.15, 77.23, 3, 5.36, 269.92,
/*L3*/  121, 0.024, 74.782, 68, 4.12, 3.93, 53, 2.39, 11.05, 46, 0.00, 0.00, 45, 2.04, 3.18, 44, 2.96, 1.48, 25, 4.89, 63.74, 21, 4.55, 70.85, 20, 2.31, 149.56, 9, 1.58, 56.62, 4, 0.23, 18.16, 4, 5.39, 76.27, 4, 0.95, 77.96, 3, 4.98, 85.83, 3, 4.13, 52.69, 3, 0.37, 78.71, 2, 0.86, 145.63, 2, 5.66, 9.56, 2, 2.68, 7.11, 2, 0.49, 71.60, 1, 5.20, 73.30, 1, 4.87, 224.34, 1, 1.25, 12.53, 1, 3.93, 22.09, 1, 2.19, 127.47, 1, 3.98, 462.02, 1, 5.06, 447.80, 1, 1.06, 138.52, 1, 0.35, 5.63, 1, 2.94, 131.40,
/*L4*/  114, 3.142, 0.000, 6, 4.58, 74.78, 3, 0.35, 11.05, 1, 3.42, 56.62, 1, 4.66, 18.16,
/*L5*/  1, 3.14, 0.00,
/*B0*/  1346278, 2.6187781, 74.7815986, 62341, 5.08111, 149.56320, 61601, 3.14159, 0.00000, 9964, 1.6160, 76.2661, 9926, 0.5763, 73.2971, 3259, 1.2612, 224.3448, 2972, 2.2437, 1.4845, 2010, 6.0555, 148.0787, 1522, 0.2796, 63.7359, 924, 4.038, 151.048, 761, 6.140, 71.813, 522, 3.321, 138.517, 463, 0.743, 85.827, 437, 3.381, 529.691, 435, 0.341, 77.751, 431, 3.554, 213.299, 420, 5.213, 11.046, 245, 0.788, 2.969, 233, 2.257, 222.860, 216, 1.591, 38.133, 180, 3.725, 299.126, 175, 1.236, 146.594, 174, 1.937, 380.128, 160, 5.336, 111.430, 144, 5.962, 35.164, 116, 5.739, 70.849, 106, 0.941, 70.328, 102, 2.619, 78.714, 86, 0.70, 39.62, 73, 0.21, 225.83, 71, 0.83, 109.95, 58, 2.67, 108.46, 54, 3.35, 184.73, 44, 2.74, 152.53, 41, 3.22, 160.61,
/*B1*/  206366, 4.123943, 74.781599, 8563, 0.3382, 149.5632, 1726, 2.1219, 73.2971, 1374, 0.0000, 0.0000, 1369, 3.0686, 76.2661, 451, 3.777, 1.484, 400, 2.848, 224.345, 307, 1.255, 148.079, 154, 3.786, 63.736, 112, 5.573, 151.048, 111, 5.329, 138.517, 83, 3.59, 71.81, 56, 3.40, 85.83, 54, 1.70, 77.75, 42, 1.21, 11.05, 41, 4.45, 78.71, 32, 3.77, 222.86, 30, 2.56, 2.97, 27, 5.34, 213.30, 26, 0.42, 380.13, 23, 2.49, 146.59, 20, 3.70, 70.85, 20, 5.93, 529.69, 20, 5.37, 299.13, 19, 3.83, 38.13, 19, 1.09, 111.43,
/*B2*/  9212, 5.8004, 74.7816, 557, 0.000, 0.000, 286, 2.177, 149.563, 95, 3.84, 73.30, 45, 4.88, 76.27, 20, 5.46, 1.48, 15, 0.88, 138.52, 14, 2.85, 148.08, 14, 5.07, 63.74, 10, 5.00, 224.34, 8, 6.27, 78.71, 5, 5.16, 71.81,
/*B3*/  268, 1.251, 74.782, 11, 3.14, 0.00, 6, 4.01, 149.56, 3, 5.78, 73.30, 2, 1.06, 63.74,
/*B4*/  6, 2.85, 74.78,
/*R0*/  1921264848, 0.0000000000, 0.0000000000, 88784984, 5.60377527, 74.78159857, 3440836, 0.3283610, 73.2971259, 2055653, 1.7829517, 149.5631971, 649322, 4.522473, 76.266071, 602248, 3.860038, 63.735898, 496404, 1.401399, 454.909367, 338526, 1.580027, 138.517497, 243508, 1.570866, 71.812653, 190522, 1.998094, 1.484473, 161858, 2.791379, 148.078724, 143706, 1.383686, 11.045700, 93192, 0.17437, 36.64856, 89806, 3.66105, 109.94569, 71424, 4.24509, 224.34480, 46677, 1.39977, 35.16409, 39026, 3.36235, 277.03499, 39010, 1.66971, 70.84945, 36755, 3.88649, 146.59425, 30349, 0.70100, 151.04767, 29156, 3.18056, 77.75054, 25786, 3.78538, 85.82730, 25620, 5.25656, 380.12777, 22637, 0.72519, 529.69097, 20473, 2.79640, 70.32818, 20472, 1.55589, 202.25340, 17901, 0.55455, 2.96895, 15503, 5.35405, 38.13304, 14702, 4.90434, 108.46122, 12897, 2.62154, 111.43016, 12328, 5.96039, 127.47180, 11959, 1.75044, 984.60033, 11853, 0.99343, 52.69020, 11696, 3.29826, 3.93215, 11495, 0.43774, 65.22037, 10793, 1.42105, 213.29910, 9111, 4.9964, 62.2514, 8421, 5.2535, 222.8603, 8402, 5.0388, 415.5525, 7449, 0.7949, 351.8166, 7329, 3.9728, 183.2428, 6046, 5.6796, 78.7138, 5524, 3.1150, 9.5612, 5445, 5.1058, 145.1098, 5238, 2.6296, 33.6796, 4079, 3.2206, 340.7709, 3919, 4.2502, 39.6175, 3802, 6.1099, 184.7273, 3781, 3.4584, 456.3938, 3687, 2.4872, 453.4249, 3102, 4.1403, 219.8914, 2963, 0.8298, 56.6224, 2942, 0.4239, 299.1264, 2940, 2.1464, 137.0330, 2938, 3.6766, 140.0020, 2865, 0.3100, 12.5302, 2538, 4.8546, 131.4039, 2364, 0.4425, 554.0700, 2183, 2.9404, 305.3462, 1979, 6.1284, 106.9767, 1963, 0.0411, 221.3759, 1963, 5.2434, 84.3428, 1849, 2.9111, 909.8187, 1830, 4.0111, 68.8437, 1656, 1.9643, 79.2350, 1643, 0.3556, 67.6681, 1632, 4.2306, 22.0914, 1585, 3.1627, 225.8293, 1563, 1.4792, 112.9146, 1507, 5.2419, 181.7583, 1482, 5.6620, 152.5321, 1477, 4.3221, 256.5399, 1439, 1.5305, 447.7958, 1409, 4.4192, 462.0229, 1404, 5.6356, 4.4534, 1401, 1.3908, 265.9893, 1250, 6.2448, 160.6089, 1249, 5.4403, 54.1747, 1248, 4.8898, 479.2884, 1228, 5.9770, 59.8037, 1197, 2.5219, 145.6310, 1091, 4.1539, 77.9630, 1072, 1.7429, 528.2065, 906, 5.620, 74.670, 900, 2.373, 74.893, 845, 0.129, 82.858, 759, 2.137, 692.587, 719, 4.000, 128.956, 710, 5.416, 218.407, 710, 4.220, 381.612, 710, 4.490, 293.189, 705, 0.455, 835.037, 700, 0.040, 143.625, 690, 3.081, 69.365, 652, 4.423, 18.159, 642, 2.711, 87.312, 630, 4.461, 275.551, 598, 0.358, 269.921, 594, 3.838, 32.195, 594, 4.501, 8.077, 588, 5.083, 186.212, 576, 5.896, 66.705, 575, 5.579, 2.448, 570, 1.639, 77.229, 557, 1.072, 1059.382, 549, 5.628, 3.181, 545, 5.694, 203.738, 542, 5.395, 278.519, 540, 6.208, 71.600, 516, 3.233, 284.149, 503, 5.839, 191.208, 496, 2.651, 200.769, 488, 0.064, 60.767, 477, 2.894, 39.357, 464, 2.354, 211.815, 464, 1.434, 297.642, 455, 2.593, 490.334, 455, 4.084, 99.161, 449, 0.280, 617.806, 437, 0.528, 209.367, 436, 2.082, 51.206, 436, 2.101, 1514.291, 436, 2.794, 75.745, 429, 3.080, 41.102, 420, 2.254, 81.001, 414, 0.090, 258.024, 410, 3.050, 404.507, 405, 6.123, 24.379, 387, 0.686, 230.565, 380, 0.058, 378.643, 368, 0.712, 125.987, 365, 5.595, 255.055, 359, 0.009, 35.425, 359, 0.352, 426.598, 358, 4.714, 173.942, 354, 4.657, 329.837, 326, 4.720, 134.585, 324, 4.829, 195.140, 320, 5.486, 14.978, 308, 3.924, 116.426, 306, 3.761, 344.703, 305, 2.555, 6208.294, 302, 0.132, 565.116, 296, 4.211, 1364.728, 293, 3.995, 72.334, 287, 1.850, 153.495, 262, 3.837, 831.105, 256, 1.167, 177.874, 250, 4.242, 75.303, 248, 1.063, 105.492, 245, 5.949, 20.607, 241, 1.605, 81.374, 234, 2.971, 46.210, 234, 4.481, 628.852, 225, 0.407, 114.399, 220, 0.196, 180.274, 220, 2.961, 120.358, 219, 0.248, 294.673, 217, 3.429, 241.610, 211, 4.931, 103.093, 205, 2.304, 259.509, 194, 6.117, 414.068, 192, 5.767, 291.704, 189, 2.236, 5.417, 188, 2.045, 408.439, 187, 3.035, 135.549, 182, 0.784, 417.037, 182, 0.707, 391.173, 179, 4.824, 366.486, 178, 3.980, 10138.504, 176, 1.960, 756.323, 176, 5.508, 7.114, 172, 5.217, 41.644, 171, 2.309, 98.900, 170, 4.950, 206.186, 170, 4.510, 288.081, 169, 4.043, 55.659, 168, 5.258, 518.645, 167, 4.922, 422.666, 164, 5.225, 67.359, 162, 3.273, 443.864, 162, 4.995, 73.818, 161, 3.823, 451.940, 157, 0.663, 220.413, 155, 4.320, 760.256, 154, 4.278, 45.577, 154, 4.707, 543.024, 152, 4.647, 155.783, 146, 2.657, 465.955, 143, 2.078, 457.878, 142, 1.270, 159.124, 134, 5.309, 14.015, 133, 2.889, 373.908, 129, 0.363, 96.873, 127, 0.424, 331.322, 125, 4.305, 339.286, 123, 2.383, 141.486, 117, 3.950, 74.260, 117, 1.837, 1289.947, 116, 4.435, 5.938, 116, 2.512, 296.157, 115, 6.249, 767.369, 113, 4.654, 80.198, 113, 0.831, 100.384, 113, 0.081, 558.002, 112, 1.212, 329.725, 111, 0.750, 80.719, 111, 0.387, 216.922, 108, 3.773, 142.450, 107, 2.394, 347.884, 107, 1.821, 306.831, 106, 0.816, 1087.693, 105, 5.945, 328.353, 104, 2.994, 6.220, 103, 0.698, 358.930, 101, 1.057, 92.308, 99, 4.33, 74.52, 98, 3.73, 75.04, 97, 0.69, 977.49, 96, 5.55, 969.62, 95, 0.80, 342.26, 94, 4.54, 28.57, 94, 4.99, 403.13, 91, 5.17, 144.15, 91, 0.22, 333.66, 90, 0.37, 0.96, 90, 3.80, 986.08, 89, 2.19, 74.83, 89, 5.88, 74.73, 89, 4.74, 604.47, 89, 4.44, 154.02, 87, 5.62, 300.61, 86, 2.83, 983.12, 85, 5.80, 6.59, 85, 1.26, 142.14, 84, 1.84, 227.31, 83, 1.88, 387.24, 83, 2.21, 74.94, 83, 5.86, 74.62, 80, 2.98, 526.72, 79, 5.67, 267.47, 78, 2.73, 110.21, 76, 2.78, 88.11, 76, 4.66, 101.87, 76, 5.41, 50.40, 75, 5.37, 373.01, 75, 1.35, 350.33, 74, 6.21, 312.46, 73, 0.58, 367.97, 71, 3.17, 23.58, 71, 3.65, 894.84, 71, 0.56, 92.94, 71, 4.66, 44.73, 70, 1.52, 552.59, 70, 3.74, 546.96, 70, 3.95, 187.70, 69, 2.45, 555.55, 69, 2.42, 235.39, 69, 4.77, 991.71, 67, 0.86, 522.58, 66, 5.05, 30.71, 65, 4.24, 771.30, 65, 0.69, 152.74, 65, 3.74, 536.80, 65, 5.27, 68.19, 64, 2.37, 157.64, 64, 0.10, 681.54, 63, 4.60, 67.88, 63, 2.90, 79.89, 63, 0.29, 119.51, 63, 5.36, 92.05, 63, 0.34, 561.18, 62, 2.68, 130.44, 62, 2.32, 74.03, 61, 0.58, 253.57,
/*R1*/  1479896, 3.6720571, 74.7815986, 71212, 6.22601, 63.73590, 68627, 6.13411, 149.56320, 24060, 3.14159, 0.00000, 21468, 2.60177, 76.26607, 20857, 5.24625, 11.04570, 11405, 0.01848, 70.84945, 7497, 0.4236, 73.2971, 4244, 1.4169, 85.8273, 3927, 3.1551, 71.8127, 3578, 2.3116, 224.3448, 3506, 2.5835, 138.5175, 3229, 5.2550, 3.9322, 3060, 0.1532, 1.4845, 2564, 0.9808, 148.0787, 2429, 3.9944, 52.6902, 1645, 2.6535, 127.4718, 1584, 1.4305, 78.7138, 1508, 5.0600, 151.0477, 1490, 2.6756, 56.6224, 1413, 4.5746, 202.2534, 1403, 1.3699, 77.7505, 1228, 1.0470, 62.2514, 1033, 0.2646, 131.4039, 992, 2.172, 65.220, 862, 5.055, 351.817, 744, 3.076, 35.164, 687, 2.499, 77.963, 647, 4.473, 70.328, 624, 0.863, 9.561, 604, 0.907, 984.600, 575, 3.231, 447.796, 562, 2.718, 462.023, 530, 5.917, 213.299, 528, 5.151, 2.969, 494, 0.463, 145.631, 487, 0.706, 380.128, 460, 4.223, 12.530, 444, 2.156, 67.668, 406, 1.230, 22.091, 381, 3.851, 3.181, 373, 5.051, 529.691, 348, 1.749, 71.600, 339, 2.538, 18.159, 272, 3.384, 222.860, 269, 6.241, 340.771, 259, 3.921, 59.804, 256, 2.957, 84.343, 255, 3.504, 38.133, 238, 2.049, 269.921, 234, 0.278, 108.461, 225, 3.910, 160.609, 222, 3.647, 137.033, 212, 0.680, 111.430, 206, 1.534, 284.149, 201, 1.249, 69.365, 196, 4.772, 299.126, 189, 4.413, 265.989, 163, 4.341, 33.680, 153, 5.218, 209.367, 151, 1.990, 54.175, 137, 0.403, 195.140, 128, 2.403, 39.618, 117, 0.396, 87.312, 107, 1.230, 225.829, 106, 0.698, 2.448, 106, 0.171, 79.235, 105, 4.436, 305.346, 104, 2.922, 134.585, 104, 1.816, 72.334, 104, 2.576, 191.208, 100, 4.941, 120.358, 97, 3.81, 152.53, 95, 4.03, 82.86, 94, 5.02, 51.21, 93, 3.09, 77.23, 86, 0.53, 145.11, 85, 0.62, 116.43, 85, 5.72, 68.84, 85, 5.56, 344.70, 78, 1.64, 479.29, 77, 0.08, 45.58, 76, 4.20, 73.82, 76, 3.79, 75.74, 72, 4.31, 565.12, 72, 3.71, 408.44, 72, 3.94, 153.50, 71, 2.38, 60.77, 65, 1.56, 106.98, 64, 1.94, 41.64, 63, 4.19, 184.73, 62, 3.24, 422.67, 62, 4.39, 453.42, 62, 3.90, 4.45, 60, 0.60, 74.89, 59, 1.56, 456.39, 58, 5.33, 220.41, 57, 0.84, 146.59, 55, 1.60, 14.98, 54, 3.73, 7.11, 53, 4.45, 426.60, 53, 5.20, 358.93, 53, 3.50, 125.99, 52, 6.09, 404.51, 52, 1.76, 8.08, 51, 0.37, 206.19, 51, 0.53, 490.33, 49, 5.85, 112.91, 49, 4.26, 5.42, 49, 0.94, 99.16, 49, 3.63, 81.00, 48, 1.97, 288.08, 46, 5.35, 152.74, 44, 3.04, 20.61, 43, 1.26, 1514.29, 42, 0.05, 128.96, 42, 2.51, 24.38, 41, 2.34, 277.03, 40, 5.10, 35.42, 39, 5.49, 200.77, 39, 0.74, 347.88, 39, 4.95, 92.94, 38, 2.06, 333.66, 38, 3.62, 173.94, 36, 3.73, 96.87, 34, 3.68, 66.92, 33, 6.26, 1059.38, 33, 1.38, 74.67, 32, 4.38, 221.38, 32, 0.54, 203.74, 31, 0.80, 373.01, 31, 2.05, 230.56, 31, 2.54, 977.49, 30, 0.71, 109.95, 30, 0.19, 387.24, 29, 5.43, 58.11, 29, 3.11, 991.71, 28, 4.77, 415.55, 28, 0.37, 80.20, 27, 2.15, 140.00, 27, 2.03, 536.80, 27, 1.36, 0.96, 26, 4.53, 454.91, 26, 3.47, 144.15, 26, 5.43, 546.96, 26, 2.57, 522.58, 25, 1.80, 143.63, 25, 5.12, 81.37, 25, 0.55, 181.76, 25, 3.04, 14.01, 24, 3.30, 617.81, 24, 2.20, 628.85, 24, 5.67, 443.86, 24, 5.60, 32.20, 24, 4.95, 561.18, 24, 0.66, 46.21, 23, 3.81, 55.14, 23, 5.85, 297.64, 22, 4.82, 135.55, 22, 4.62, 391.17, 22, 4.59, 241.61, 22, 1.23, 41.10, 21, 5.27, 159.12, 21, 4.19, 329.73, 21, 0.24, 465.96, 21, 0.91, 76.48, 20, 3.16, 186.21, 20, 0.66, 66.70, 20, 1.30, 518.65, 20, 4.91, 909.82,
/*R2*/  22440, 0.69953, 74.78160, 4727, 1.6990, 63.7359, 1682, 4.6483, 70.8494, 1650, 3.0966, 11.0457, 1434, 3.5212, 149.5632, 770, 0.000, 0.000, 500, 6.172, 76.266, 461, 0.767, 3.932, 390, 4.496, 56.622, 390, 5.527, 85.827, 292, 0.204, 52.690, 287, 3.534, 73.297, 273, 3.847, 138.517, 220, 1.964, 131.404, 216, 0.848, 77.963, 205, 3.248, 78.714, 149, 4.898, 127.472, 129, 2.081, 3.181, 117, 4.934, 447.796, 114, 4.787, 145.631, 113, 1.014, 462.023, 104, 3.586, 71.600, 99, 6.16, 224.34, 91, 0.68, 18.16, 89, 0.23, 202.25, 88, 2.93, 62.25, 71, 6.10, 454.91, 64, 3.39, 1.48, 64, 3.96, 67.67, 62, 3.30, 351.82, 59, 5.56, 9.56, 58, 4.91, 22.09, 51, 3.87, 65.22, 49, 3.75, 269.92, 44, 5.90, 71.81, 44, 1.93, 59.80, 42, 6.14, 284.15, 42, 2.62, 151.05, 42, 2.09, 12.53, 37, 5.91, 984.60, 36, 5.40, 77.75, 31, 4.59, 148.08, 31, 2.27, 195.14, 28, 4.58, 77.23, 28, 4.91, 277.03, 27, 3.53, 209.37, 26, 0.66, 120.36, 24, 5.87, 69.36, 23, 1.04, 84.34, 23, 1.71, 160.61, 21, 2.20, 45.58, 20, 2.32, 2.45, 17, 4.37, 54.17, 17, 4.78, 213.30, 17, 1.86, 340.77, 16, 0.40, 265.99, 16, 3.65, 152.74, 15, 5.44, 408.44, 14, 3.39, 358.93, 13, 1.53, 422.67, 13, 5.25, 137.03, 13, 1.26, 134.59, 13, 4.43, 87.31, 13, 3.03, 92.94, 12, 1.33, 51.21, 12, 3.24, 116.43, 12, 5.10, 191.21, 12, 4.66, 41.64, 12, 3.73, 220.41, 12, 4.17, 60.55, 11, 2.03, 7.11, 11, 1.08, 72.33, 10, 1.19, 344.70, 10, 0.33, 70.33, 10, 5.97, 35.16, 10, 3.06, 2.97, 10, 0.39, 415.55, 9, 2.44, 565.12, 9, 6.05, 146.38, 9, 5.19, 225.83, 9, 6.01, 5.42, 9, 5.82, 153.50, 9, 5.25, 347.88, 8, 3.91, 333.66, 8, 4.49, 70.12, 8, 3.72, 14.98, 8, 2.27, 299.13, 8, 2.26, 206.19, 8, 5.72, 55.14, 8, 0.90, 222.86, 7, 1.51, 991.71, 7, 1.18, 96.87,
/*R3*/  1164, 4.7345, 74.7816, 212, 3.343, 63.736, 196, 2.980, 70.849, 105, 0.958, 11.046, 73, 1.00, 149.56, 72, 0.03, 56.62, 55, 2.59, 3.93, 36, 5.65, 77.96, 34, 3.82, 76.27, 32, 3.60, 131.40, 30, 3.44, 85.83, 28, 0.43, 3.18, 27, 2.55, 52.69, 25, 5.14, 78.71, 19, 5.13, 18.16, 18, 0.00, 0.00, 16, 5.20, 71.60, 16, 0.37, 447.80, 15, 2.97, 145.63, 15, 5.57, 462.02, 15, 3.86, 73.30, 11, 6.03, 138.52, 11, 3.58, 224.34, 8, 2.62, 22.09, 8, 0.30, 127.47, 8, 1.45, 1.48, 7, 5.44, 269.92, 7, 0.01, 151.05, 6, 4.37, 284.15, 6, 4.23, 373.01, 5, 4.16, 195.14, 5, 0.78, 62.25, 5, 1.84, 202.25, 5, 2.78, 120.36, 4, 3.96, 9.56, 4, 1.84, 72.33, 4, 1.86, 152.74, 4, 1.89, 209.37, 4, 1.05, 92.94, 4, 2.00, 65.22, 4, 1.17, 153.50, 4, 3.93, 124.29, 3, 1.54, 148.08, 3, 1.41, 351.82, 3, 2.99, 387.24, 3, 5.84, 160.61, 3, 6.04, 12.53, 3, 0.79, 572.23, 3, 5.65, 134.59, 3, 2.77, 213.30, 3, 1.99, 450.98,
/*R4*/  53, 3.01, 74.78, 10, 1.91, 56.62, 7, 5.09, 11.05, 7, 5.43, 149.56, 4, 5.23, 131.40, 3, 1.30, 85.83, 3, 3.14, 0.00, 3, 0.44, 63.74, 2, 6.21, 358.93, 2, 0.92, 145.63, 2, 2.23, 440.68),

  //Dnep精度:J2000+-4千年 黄经1角秒 黄纬1角秒 距离40AU/10^6
  new Array(
    100000000,//A的倍率
    20, 188, 260, 281, 293, 299, 302, 359, 404, 419, 422, 425, 425, 638, 701, 743, 746, 746, 746,//位置索引表
/*L0*/  531188633, 0.000000000, 0.000000000, 1798476, 2.9010127, 38.1330356, 1019728, 0.4858092, 1.4844727, 124532, 4.830081, 36.648563, 42064, 5.41055, 2.96895, 37715, 6.09222, 35.16409, 33785, 1.24489, 76.26607, 16483, 0.00008, 491.55793, 9199, 4.9375, 39.6175, 8994, 0.2746, 175.1661, 4216, 1.9871, 73.2971, 3365, 1.0359, 33.6796, 2285, 4.2061, 4.4534, 1434, 2.7834, 74.7816, 900, 2.076, 109.946, 745, 3.190, 71.813, 506, 5.748, 114.399, 400, 0.350, 1021.249, 345, 3.462, 41.102, 340, 3.304, 77.751, 323, 2.248, 32.195, 306, 0.497, 0.521, 287, 4.505, 0.048, 282, 2.246, 146.594, 267, 4.889, 0.963, 252, 5.782, 388.465, 245, 1.247, 9.561, 233, 2.505, 137.033, 227, 1.797, 453.425, 170, 3.324, 108.461, 151, 2.192, 33.940, 150, 2.997, 5.938, 148, 0.859, 111.430, 119, 3.677, 2.448, 109, 2.416, 183.243, 103, 0.041, 0.261, 103, 4.404, 70.328, 102, 5.705, 0.112, 98, 2.81, 8.08, 86, 4.23, 490.07, 82, 5.20, 493.04, 78, 4.16, 4.19, 74, 1.33, 529.69, 72, 5.30, 350.33, 64, 3.55, 168.05, 63, 0.15, 182.28, 58, 3.50, 145.11, 48, 1.11, 112.91, 48, 0.13, 484.44, 48, 2.58, 219.89, 47, 4.57, 46.21, 47, 4.50, 173.68, 47, 3.02, 498.67, 45, 5.47, 176.65, 39, 1.67, 213.30, 39, 2.39, 2.92,
/*L1*/  3837687717, 0.0000000000, 0.0000000000, 16604, 4.86319, 1.48447, 15807, 2.27923, 38.13304, 3335, 3.6820, 76.2661, 1306, 3.6732, 2.9689, 605, 1.505, 35.164, 179, 3.453, 39.618, 107, 2.451, 4.453, 106, 2.755, 33.680, 73, 5.49, 36.65, 57, 1.86, 114.40, 57, 5.22, 0.52, 35, 4.52, 74.78, 32, 5.90, 77.75, 30, 3.67, 388.47, 29, 5.17, 9.56, 29, 5.17, 2.45, 26, 5.25, 168.05, 25, 4.73, 182.28, 20, 5.79, 1021.25, 19, 1.83, 484.44, 19, 1.32, 498.67, 15, 3.99, 32.20, 15, 4.95, 137.03,
/*L2*/  53893, 0.00000, 0.00000, 296, 1.855, 1.484, 281, 1.191, 38.133, 270, 5.721, 76.266, 23, 1.21, 2.97, 9, 4.43, 35.16, 7, 0.54, 2.45,
/*L3*/  31, 0.00, 0.00, 15, 1.35, 76.27, 12, 6.04, 1.48, 12, 6.11, 38.13,
/*L4*/  114, 3.142, 0.000, 1, 3.18, 76.27,
/*L5*/  1, 3.14, 0.00,
/*B0*/  3088623, 1.4410437, 38.1330356, 27780, 5.91272, 76.26607, 27624, 0.00000, 0.00000, 15448, 3.50877, 39.61751, 15355, 2.52124, 36.64856, 2000, 1.5100, 74.7816, 1968, 4.3778, 1.4845, 1015, 3.2156, 35.1641, 606, 2.802, 73.297, 595, 2.129, 41.102, 589, 3.187, 2.969, 402, 4.169, 114.399, 280, 1.682, 77.751, 262, 3.767, 213.299, 254, 3.271, 453.425, 206, 4.257, 529.691, 140, 3.530, 137.033, 99, 4.17, 33.68, 68, 4.67, 71.81,
/*B1*/  227279, 3.807931, 38.133036, 1803, 1.9758, 76.2661, 1433, 3.1416, 0.0000, 1386, 4.8256, 36.6486, 1073, 6.0805, 39.6175, 148, 3.858, 74.782, 136, 0.478, 1.484, 70, 6.19, 35.16, 52, 5.05, 73.30, 43, 0.31, 114.40, 37, 4.89, 41.10, 37, 5.76, 2.97, 26, 5.22, 213.30, 19, 0.90, 453.42, 17, 4.26, 77.75,
/*B2*/  9691, 5.5712, 38.1330, 79, 3.63, 76.27, 72, 0.45, 36.65, 59, 3.14, 0.00, 30, 1.61, 39.62,
/*B3*/  273, 1.017, 38.133,
/*B4*/  6, 2.67, 38.13,
/*B5*/
/*R0*/  3007013206, 0.0000000000, 0.0000000000, 27062259, 1.32999459, 38.13303564, 1691764, 3.2518614, 36.6485629, 807831, 5.185928, 1.484473, 537761, 4.521139, 35.164090, 495726, 1.571057, 491.557929, 274572, 1.845523, 175.166060, 135134, 3.372206, 39.617508, 121802, 5.797544, 76.266071, 100895, 0.377027, 73.297126, 69792, 3.79617, 2.96895, 46688, 5.74938, 33.67962, 24594, 0.50802, 109.94569, 16939, 1.59422, 71.81265, 14230, 1.07786, 74.78160, 12012, 1.92062, 1021.24889, 8395, 0.6782, 146.5943, 7572, 1.0715, 388.4652, 5721, 2.5906, 4.4534, 4840, 1.9069, 41.1020, 4483, 2.9057, 529.6910, 4421, 1.7499, 108.4612, 4354, 0.6799, 32.1951, 4270, 3.4134, 453.4249, 3381, 0.8481, 183.2428, 2881, 1.9860, 137.0330, 2879, 3.6742, 350.3321, 2636, 3.0976, 213.2991, 2530, 5.7984, 490.0735, 2523, 0.4863, 493.0424, 2306, 2.8096, 70.3282, 2087, 0.6186, 33.9402, 1977, 5.1170, 168.0525, 1905, 1.7219, 182.2796, 1654, 1.9278, 145.1098, 1499, 1.0162, 219.8914, 1435, 1.7001, 484.4444, 1403, 6.0766, 173.6816, 1403, 4.5891, 498.6715, 1399, 0.7622, 176.6505, 1228, 1.5988, 77.7505, 1129, 5.9666, 9.5612, 835, 3.971, 114.399, 811, 3.003, 46.210, 732, 2.104, 181.758, 705, 1.187, 256.540, 616, 2.979, 106.977, 530, 4.241, 111.430, 502, 1.387, 5.938, 437, 2.270, 1550.940, 422, 5.532, 525.498, 421, 1.891, 30.711, 400, 1.256, 8.077, 382, 3.300, 983.116, 355, 2.278, 218.407, 345, 1.359, 293.189, 333, 5.751, 39.096, 321, 1.506, 454.909, 314, 3.959, 381.352, 309, 2.855, 72.073, 307, 0.320, 601.764, 306, 2.725, 6244.943, 294, 4.891, 528.206, 292, 4.024, 68.844, 281, 4.542, 44.725, 280, 1.541, 98.900, 268, 5.133, 112.915, 251, 3.540, 312.199, 248, 3.411, 37.612, 246, 1.015, 141.226, 240, 3.164, 143.625,
/*R1*/  236339, 0.704980, 38.133036, 13220, 3.32015, 1.48447, 8622, 6.2163, 35.1641, 2702, 1.8814, 39.6175, 2155, 2.0943, 2.9689, 2153, 5.1687, 76.2661, 1603, 0.0000, 0.0000, 1464, 1.1842, 33.6796, 1136, 3.9189, 36.6486, 898, 5.241, 388.465, 790, 0.533, 168.053, 760, 0.021, 182.280, 607, 1.077, 1021.249, 572, 3.401, 484.444, 561, 2.887, 498.671, 490, 3.468, 137.033, 271, 3.274, 71.813, 264, 0.862, 4.453, 204, 2.418, 32.195, 155, 0.365, 41.102, 133, 3.602, 9.561,
/*R2*/  4247, 5.8991, 38.1330, 218, 0.346, 1.484, 163, 2.239, 168.053, 156, 4.594, 182.280, 127, 2.848, 35.164, 118, 5.103, 484.444, 112, 1.190, 498.671, 99, 3.42, 175.17, 77, 0.02, 491.56, 65, 3.46, 388.47, 50, 4.07, 76.27, 39, 6.10, 1021.25, 37, 5.97, 2.97, 36, 5.17, 137.03,
/*R3*/  166, 4.552, 38.133)

);


/********************************
冥王星星历数据表
********************************/
var XL0Pluto = new Array( //冥王星

  new Array(3670347369, 254266726, 33423175, 451726393, 508545104, 35472192, 84376237, 762832697, 1315590, 44486864, 210752393, 27599981, 40933408, 207755164, 6168337, 19050728, 1017104358, 3249687, 14459892, 266376252, 17851506, 9031454, 274585346, 5087385, 6554000, 522183295, 4050313, 6102463, 527798297, 31298161, 5934799, 235178975, 21074845, 4572990, 1271382113, 5137558, 3982588, 814160370, 15439300, 3716251, 480061483, 5182267, 3687493, 303024336, 20475757, 3613380, 223750052, 25529763, 3526913, 817565750, 1361514, 2830938, 488394805, 30934902, 2660160, 308916374, 9405225, 2364561, 475438751, 17615841, 2254502, 535061113, 21872888, 1899854, 749461283, 88900, 1871795, 777395028, 31727482, 1558618, 30189105, 6137438, 1509389, 713274081, 9031015, 1324105, 194208507, 25689952, 1245892, 32747384, 28566478, 1209727, 1525654203, 6787921, 1163275, 708077853, 21057150, 1155503, 290066741, 8791815, 1039711, 119669067, 30291052, 854194, 1004780056, 4601575, 852775, 317260479, 790571, 826952, 545502775, 15458302, 734703, 1029985337, 33557684, 658988, 127555821, 27753187, 629821, 465509264, 24733991, 526712, 388855124, 13859947, 513490, 788617188, 23806972, 508504, 724367273, 3730023, 495552, 5296915421, 12437857, 466082, 799663728, 17369454, 461769, 39197826, 19575585, 392423, 2031609976, 10958129, 384996, 380283753, 18479682, 383668, 15755335, 10477382, 361802, 184437224, 32250746, 355241, 556263379, 8309980, 351617, 735545369, 852436, 329998, 1779927509, 8590564, 320525, 2034205768, 32876335, 284625, 828556267, 13831416, 271807, 2132978353, 13978299, 258922, 1257847792, 4073980, 252741, 454824044, 32573229, 221397, 1285658757, 66458, 184105, 326318176, 28881856, 156462, 110312447, 125060, 152236, 50699235, 9159202, 144258, 565164798, 246535, 135974, 634999990, 14499445, 128851, 1513256735, 6034954, 118273, 152604788, 31876533, 112254, 996349240, 12857615, 102507, 631525416, 24617867, 100384, 396751429, 1597716, 99529, 144500970, 34455393, 93241, 167046390, 29320722, 92821, 1539302037, 288341, 90244, 444397678, 4194283, 79448, 622542072, 30539278, 62321, 838122416, 6698517, 57057, 694635401, 5424872, 53495, 101198791, 5512272, 53055, 1039298462, 26169865, 51675, 63505889, 645935, 49765, 1249270801, 10580653, 45188, 985724537, 13346278, 41294, 1767399707, 8039571, 39977, 574845986, 30078339, 38492, 363679436, 24514164, 36883, 346241178, 33551568, 35004, 889717498, 23166337, 33909, 1294680530, 26183309, 33066, 1793564454, 1964270, 28434, 430653466, 6519845, 27448, 1506386376, 13501678, 25318, 2288459373, 12093013, 24250, 414416901, 7290394, 23751, 881645279, 1398422, 21743, 1239314363, 13969644, 20901, 611578209, 877266, 19300, 900003205, 22097997, 19024, 643200234, 14044632, 17639, 658357828, 1548988, 15685, 1548452229, 25563089, 14703, 80132610, 34603828, 14089, 2020918264, 10712799, 12128, 594022404, 33826308, 11542, 851102446, 3450259, 11225, 10593517488, 14780703, 10677, 1306106438, 18939814, 9731, 2047579983, 1923259, 9633, 674514843, 392489, 8870, 1495409766, 17082296, 8459, 1060549232, 29015118, 8394, 4264995999, 9485590, 8192, 1143798703, 22079985, 7649, 1049816228, 21240239, 7206, 2542717740, 14387460, 6619, 975008199, 25504230, 6584, 1759143661, 14127292, 5922, 1802685061, 27335915, 5307, 867633840, 4747248, 5117, 1559452781, 18038947, 4738, 911160446, 15030317, 4703, 1228405854, 19794711, 4327, 2274341644, 8796168, 4222, 2303501344, 5833665, 3919, 967347334, 7973000, 3714, 921954285, 12027115, 3626, 1397985312, 26032090, 3383, 1132055729, 34320308, 3090, 1316562606, 8644794, 2664, 1155619373, 25354050, 2597, 2060867014, 28994646, 2399, 2135425184, 25675938, 2391, 2012255805, 16810382, 2068, 1392553808, 6294884, 2027, 2796950957, 16185633, 2011, 2199849507, 13164123, 2009, 933464235, 6446146, 1937, 1567813517, 6055882, 1845, 1076163159, 1422686, 1802, 2311193720, 30359052, 1770, 1747388447, 16357270, 1749, 1812706257, 19324361, 1717, 2489240697, 5631799, 1704, 2485988933, 18527793, 1608, 5229816866, 13052190, 1563, 1118184209, 604802, 1561, 5363993402, 29658824, 1528, 1404714801, 20736114, 1326, 1217681139, 21132831, 1300, 2138607972, 10908342, 1274, 2265776375, 14158817, 1272, 948792882, 6894461, 1039, 1652818871, 25691326, 1030, 1482087208, 22793899, 916, 2528441493, 12025525, 913, 1368565334, 34541981, 882, 2557335928, 8536249, 875, 10600232507, 13285317, 730, 1470159327, 16891410, 678, 3051107045, 18014005, 669, 2994563917, 16428852, 655, 2317321123, 19221659, 626, 2070143827, 34477150, 612, 3248895486, 18087573, 605, 2740326133, 11898926, 591, 2002386791, 20901901, 535, 1165416196, 10088620, 484, 1203718017, 28163276, 427, 2256532316, 19535128, 418, 1707852223, 21645381, 409, 1455881839, 24743694, 401, 1328939334, 35862435, 388, 15890116298, 15970756, 388, 1821853742, 8986707, 362, 28966575128, 19300791, 359, 4197699918, 25335970, 353, 1623578884, 34203600, 342, 6396989474, 5598952, 333, 3503098350, 20473630, 332, 1732629954, 21349911, 328, 10583912650, 13575900, 305, 1191236695, 6426054, 294, 1907969543, 28541018, 290, 1572066000, 25455317, 279, 4269993867, 19935497, 257, 2231604897, 12408493, 246, 1095755642, 6352192, 213, 1971287434, 28306210, 211, 10335301024, 3857916, 203, 1695873384, 32280701, 195, 1646025801, 5962845, 194, 1444284984, 4971843, 193, 2783784786, 12947699, 190, 1634443589, 33674136, 185, 1359062857, 8435354, 184, 1110347323, 34589467, 177, 1976200122, 8927298, 142, 3164098245, 23729784),

  new Array(34052639, 207755164, 15025372, 27827367, 254266726, 32035606, 11432851, 290066741, 32606260, 3856744, 817565750, 28340833, 2670372, 508545104, 9418546, 1795318, 127555821, 12365985, 1491030, 708077853, 29959939, 1401087, 762832697, 35172997, 922501, 380283753, 31225160, 423220, 1017104358, 221495, 279832, 2034205768, 22942744, 120860, 1271382113, 1533026, 43528, 1525654203, 33819404, 29872, 1060549232, 15568453, 14752, 1779927509, 1283605, 1572, 2485988933, 28310598, 1261, 2288459373, 7975959, 1008, 4264995999, 28863151, 790, 10600232507, 2768794, 461, 2542717740, 12158934, 148, 2796950957, 14202929, 142, 6396989474, 23205403, 108, 5296915421, 2952142, 87, 2994563917, 24567951, 69, 2740326133, 19805149, 40, 3051107045, 13963642),
  new Array(683715619, 254266726, 24072450, 188094335, 508545104, 25325000, 43192580, 762832697, 26023009, 13762952, 1017104358, 27005715, 3905150, 1271382113, 28561460, 1126430, 1525654203, 29151199, 354224, 1779927509, 30345991, 31334, 2288459373, 32928119, 10939, 2542717740, 35855543, 3085, 2796950957, 2181048, 1235, 3051107045, 3083376, 927, 2740326133, 23457636, 667, 5296915421, 5366339),

  new Array(3801724260, 254268311, 24369089, 463280503, 508546316, 26342607, 87660505, 762833837, 28266608, 63049092, 211857679, 4051272, 50583722, 207769457, 17288975, 37735778, 285552595, 33889492, 28538169, 290068740, 21148758, 19612219, 1017105627, 30205121, 9768359, 198246853, 6966913, 8934291, 527639263, 27515574, 7256594, 224224674, 35186664, 6549133, 521555619, 2398797, 6295436, 299569919, 32267690, 5580196, 964998812, 8248630, 5391037, 272866646, 30991675, 5045667, 962241009, 23078876, 4730484, 1271383567, 32033463, 3889206, 533967701, 16810220, 2285350, 121098086, 11087373, 2220301, 127328391, 191956, 2067650, 235305318, 26547089, 1923645, 186884464, 12142911, 1919592, 777358143, 25270340, 1872477, 488394852, 18118814, 1703128, 129946901, 23024509, 1677354, 749052005, 28766211, 1608159, 480224560, 27534456, 1346560, 115247437, 21486916, 1268598, 311189298, 27572758, 1239221, 1525655495, 33798151, 1225685, 37034447, 9048393, 1159791, 475520275, 1805588, 1085855, 545059613, 10356986, 1048964, 817637646, 18912074, 950023, 172422273, 13838405, 886333, 829016014, 14158880, 838460, 1003795697, 31889688, 734331, 163833603, 22112620, 712636, 30186412, 24094901, 672532, 1031686022, 27218638, 653469, 714954907, 24403145, 593291, 801684695, 18077279, 512069, 319889900, 19774993, 501968, 789953911, 22939784, 495428, 5296915766, 3437679, 477596, 952595892, 12213691, 464404, 699600592, 25299519, 464001, 555458970, 3791592, 407479, 152383706, 27379434, 397670, 15755335, 33702905, 336298, 1779928958, 35478117, 303090, 465354979, 9158732, 290146, 103654752, 26421009, 271489, 2132975520, 5005049, 256037, 1257677883, 31205604, 246934, 734933865, 34137431, 243053, 838942965, 7618964, 240212, 564570316, 32954278, 233367, 991567300, 2229887, 231572, 379965875, 4283039, 227314, 979430655, 6022228, 221670, 708033325, 33468617, 219686, 1285677658, 27322936, 209910, 51235633, 3117657, 153949, 90572972, 29431306, 148047, 635067614, 9393616, 147100, 392053525, 9381276, 141396, 366619187, 17366072, 127325, 329977909, 13095871, 109952, 1512099445, 32440930, 105979, 1040774528, 20626884, 103865, 79013381, 33957699, 100455, 573484085, 25482203, 96553, 943950875, 20390359, 92501, 67177990, 1205057, 89480, 2034205306, 1601235, 86214, 1539536782, 28048525, 85560, 689200267, 31435575, 71298, 848641870, 742982, 66842, 626945146, 19945525, 57512, 454130394, 18064730, 47224, 1248824548, 2255415, 46247, 645755744, 6854238, 42193, 1766756299, 33663382, 41274, 1078924588, 29413814, 39598, 404839934, 30757535, 38107, 617653898, 21112445, 33060, 1057046754, 19557185, 32067, 1793741713, 28917512, 28934, 657352901, 31680334, 28455, 1295311323, 18761623, 28257, 588151136, 23864477, 27015, 2288462042, 3009677, 25624, 1505122813, 4925807, 25018, 351329832, 22549257, 24308, 1071888736, 4686112, 21765, 413623563, 20553088, 21721, 672725506, 31030567, 21183, 901490943, 22598262, 19806, 1143912274, 15096455, 19515, 880233076, 33130977, 19344, 603548826, 24562005, 18833, 1239060141, 5458922, 18032, 864681982, 1985204, 17182, 910765783, 18313478, 17168, 1138841894, 29683221, 15890, 925352173, 16955086, 13944, 424156466, 12537920, 11926, 1549072750, 18433812, 11118, 10593517642, 5494959, 10963, 1759790077, 5075230, 9718, 2021155892, 71311, 9063, 1307452309, 12501600, 8555, 1494617489, 8234636, 8393, 4264933614, 515667, 7604, 2542728722, 5016899, 6936, 2052408570, 7906, 6762, 1087899381, 22202344, 5994, 1803073868, 18199704, 4641, 1228345603, 14582054, 4420, 889652076, 12276357, 4203, 2275314710, 1681902, 3866, 2302041663, 31856734, 3669, 1561198117, 12561636, 3570, 2062374507, 25710213, 3212, 1398280272, 14452916, 2825, 1319727947, 4304461, 2746, 1751101340, 11068927, 2417, 1159192991, 23060102, 2207, 1120889819, 18520004, 2127, 2797010985, 6966610, 2104, 2200271542, 4602585, 1780, 1812035562, 8877006, 1643, 5229831410, 4480512, 1575, 1213542071, 23572775, 1567, 2069527463, 21434746, 1511, 5364025634, 20726386, 1201, 2529424860, 3363075, 1175, 2012500282, 3387074, 1123, 2142769384, 13576752, 1095, 1570605058, 2146941, 1078, 1106175607, 26720832, 990, 1386412240, 24704388, 970, 2557291618, 34973177, 887, 1486368447, 19232866, 877, 1652331542, 14783668, 845, 1409062214, 14207766, 751, 2994714970, 27174070, 698, 1377804781, 23969494, 680, 3248859241, 27034378, 679, 2310929699, 20382526, 674, 1201688902, 35485005, 667, 1367124929, 5552496, 638, 1328057769, 29805487, 605, 1168932924, 10330289, 603, 2265744558, 5844132, 579, 1417188811, 32494406, 567, 1473691221, 31610621, 548, 2988957858, 9492427, 505, 1451072960, 29536594, 488, 2740638578, 24359002, 477, 6396989682, 32437811, 419, 15890117430, 7568474, 400, 3503186454, 27191548, 390, 4197517652, 17501566, 373, 1822853029, 34633614, 368, 3051379393, 3823683, 355, 2080380979, 12196881, 353, 2000406819, 4038333, 345, 2150096820, 3636741, 343, 2487060416, 24349781, 334, 28966577284, 30475845, 311, 1905732495, 15531888, 305, 1971543056, 4510862, 301, 1664585682, 16534439, 271, 2783387540, 5366629, 225, 1707318572, 32402650, 217, 10584807239, 6736678, 213, 3165190130, 15898582, 202, 2232586360, 21259912, 167, 10335163453, 32009671, 131, 1631365046, 23106022, 84, 4258800323, 23712859),

  new Array(80804140, 207769457, 26531049, 50719365, 290068740, 12415379, 11472134, 254268311, 25618664, 4979501, 508546316, 19782497, 4953185, 962241009, 32156767, 2374022, 30186412, 27543552, 1886756, 708033325, 7752128, 1506629, 762833837, 28579610, 755704, 817637646, 28548258, 681675, 1017105627, 26099248, 147224, 379965875, 18202065, 135058, 1271383567, 28826549, 90898, 1071888736, 11571610, 38934, 1525655495, 29281385, 20416, 1143912274, 7713426, 11431, 1779928958, 28387560, 7817, 2034205306, 27063657, 1618, 2288462042, 35157529, 1587, 2132975520, 29835109, 1185, 4264933614, 17807789, 1180, 10593517642, 4977849, 750, 2994714970, 24241953, 526, 2542728722, 34064501, 335, 2200271542, 29659695, 316, 2232586360, 11645105, 195, 5296915766, 24301220, 165, 2797010985, 284821, 119, 3248859241, 28526275, 101, 3051379393, 35183175),
  new Array(772271932, 254268311, 14911362, 184062365, 508546316, 16596719, 50129791, 762833837, 16928991, 15148915, 1017105627, 18058711, 4252480, 817637646, 982984, 4133858, 1271383567, 19503193, 1222592, 1525655495, 20448507, 356801, 1779928958, 21406717, 111204, 2034205306, 24042252, 35616, 2288462042, 23958109, 11162, 2542728722, 26154051, 3248, 2797010985, 28608512, 2263, 2132975520, 4774985, 622, 5296915766, 33540159),

  new Array(1133667870, 254280995, 13338138, 138865302, 508559277, 15312231, 25786193, 762843151, 17286675, 5831467, 1017119252, 19095069, 4537017, 210649393, 18415805, 4247236, 207771057, 33106930, 1960513, 274581696, 13594265, 1397146, 1271397853, 21076178, 1245076, 266867437, 15276633, 1037165, 480163084, 15902889, 921367, 488394807, 6976064, 919221, 235527673, 5398616, 745373, 303759437, 27741528, 730018, 475674648, 27661676, 662876, 522520140, 7931213, 606521, 223954082, 16828813, 553865, 309488240, 16432404, 511788, 528024348, 20750463, 411483, 32039817, 13367419, 391873, 749196722, 17732254, 373717, 29277443, 25443983, 371040, 1525670549, 22683316, 330657, 779017437, 15614969, 266764, 1004426809, 19256486, 234610, 534982614, 10869718, 234126, 1030302360, 12897863, 195378, 127588729, 11267444, 191315, 317549556, 7962047, 181074, 290082858, 23643579, 166145, 465279259, 34069784, 162434, 39191012, 2828462, 160179, 810674052, 15423800, 134275, 119263370, 11039470, 115360, 194373014, 20977409, 108711, 15755335, 30886532, 103420, 1779943254, 24210920, 92412, 380826926, 33782846, 83213, 817539253, 4882351, 82415, 828228525, 18115637, 74588, 390173823, 31089027, 72507, 545785335, 219387, 68474, 635045920, 2884159, 65833, 144906265, 4882269, 63267, 1257682624, 20291027, 62930, 1285732448, 16259498, 56209, 738944142, 28406342, 48576, 632054971, 19899307, 46716, 995492500, 25851210, 46181, 326429374, 17870, 45990, 793772607, 16024837, 43728, 454193840, 5001083, 40569, 1512831636, 21429318, 35559, 836023267, 9388744, 34315, 183889507, 27796760, 33786, 50670486, 27126788, 31315, 152596906, 28962242, 29577, 1039064218, 2393782, 29098, 1539532966, 16416339, 29036, 364765526, 3626362, 28407, 2034213428, 26116167, 25914, 725001021, 18389382, 25160, 642353613, 32024649, 24396, 985083534, 28503179, 19097, 700062571, 8939518, 17701, 1767534565, 23188595, 17354, 397700830, 13191221, 17322, 556680140, 25265615, 16232, 167065755, 28945419, 15554, 1234449118, 27363915, 14004, 847333738, 5116540, 12821, 1793777449, 17562277, 12189, 1241715242, 20138255, 11540, 2133412787, 29700941, 11439, 5296684673, 28943697, 10917, 1505908120, 29278794, 10112, 443393406, 10175690, 9996, 1050278869, 30734939, 9649, 1228446787, 2203283, 8978, 63424059, 15473909, 8462, 346196274, 7192504, 8360, 1295196722, 6950965, 8167, 975157960, 390440, 8153, 889754645, 3817649, 7962, 2288479046, 28123884, 6500, 853644882, 31206668, 5815, 112215710, 5743422, 5789, 1548490093, 5873215, 5522, 101168630, 18960519, 5193, 1759524686, 29839592, 5074, 882842521, 20679892, 5010, 620800165, 7645254, 4795, 2021251353, 24313332, 4081, 691561026, 16110577, 4040, 430844675, 11423406, 3840, 899624223, 2481053, 3785, 2047515952, 18979861, 3642, 708098880, 1326540, 3475, 1802392481, 7356237, 3387, 1496535048, 34446710, 2886, 1306720273, 35596883, 2584, 657697940, 19005430, 2580, 1061423016, 20540287, 2499, 79247558, 6569394, 2421, 571707004, 17077798, 2409, 2542728933, 29848453, 2359, 1143399923, 1009665, 2201, 1218459384, 9274451, 2133, 869487099, 32282063, 1887, 1558167257, 33377358, 1803, 1752192561, 2334292, 1779, 1151632630, 35218908, 1614, 607996387, 20197927, 1586, 964473182, 8685993, 1488, 5300038485, 2891699, 1329, 2013734217, 30776339, 1274, 1811892412, 35848744, 1220, 2275182236, 26569541, 1044, 1397791249, 3804343, 1038, 2302195002, 21371817, 909, 414894814, 12969636, 893, 1316479001, 24289300, 887, 1113990153, 16871488, 788, 1484662634, 4296039, 673, 2057229748, 9399282, 668, 1369535357, 20611312, 618, 5304372528, 22751646, 613, 2796973737, 32014582, 579, 675864600, 15739030, 515, 1737204464, 2677167, 498, 584380560, 5500100, 466, 2529885752, 29187488, 455, 920368370, 33912578, 446, 1566789696, 22643200, 438, 1205946310, 16971455, 426, 1819609025, 26884476, 408, 2006238186, 2111601, 406, 1624106077, 22907676, 378, 1389581559, 19750017, 367, 1077559236, 14222850, 363, 2556144473, 23455089, 363, 1126782138, 6574249, 358, 4265267660, 24224356, 308, 2139360428, 29662581, 285, 911457889, 16543167, 280, 1466317498, 578640, 271, 1166362708, 22362782, 269, 1408352521, 6312199, 265, 10593275713, 31166656, 255, 3248772593, 3279784, 245, 2994357851, 1826487, 233, 1452613646, 7532245, 228, 1958177456, 8175282, 218, 1879193617, 28817896, 213, 2266389680, 31238700, 206, 2124616963, 24361203, 203, 3503034344, 5939232, 202, 2065958476, 4788077, 198, 934850710, 28148436, 197, 1723542680, 8313223, 194, 4011130733, 11512589, 189, 2739213891, 35731115, 185, 1652442455, 6639994, 159, 1905524129, 891767, 157, 1101986663, 23999195, 138, 2310991087, 9377996, 124, 2387493234, 29353929, 116, 1329659035, 12921491, 103, 3051164934, 28133508, 103, 2208861101, 8329909, 91, 2483148477, 32516261),

  new Array(3379410, 207771057, 6740409, 2538404, 254280995, 16003410, 1974622, 508559277, 16817731, 1956643, 290082858, 4576821, 458692, 762843151, 14139543, 348961, 817539253, 32389480, 200033, 127588729, 30044336, 125585, 1017119252, 16282380, 124453, 380826926, 12080622, 63438, 708098880, 27856065, 43567, 1271397853, 19354574, 12791, 1525670549, 14066830, 6249, 1779943254, 13191927, 3190, 1143399923, 16426205, 782, 2034213428, 18572603, 401, 2288479046, 23065350, 330, 5304372528, 12968530, 140, 2542728933, 21603766, 135, 2739213891, 7345344, 22, 2796973737, 15109066),
  new Array(225556184, 254280995, 3805165, 52962475, 508559277, 5186182, 14682314, 762843151, 6404936, 4035828, 1017119252, 6830379, 1221030, 1271397853, 8675210, 346495, 1525670549, 9024942, 105263, 1779943254, 9243398, 33114, 2034213428, 11140273, 10618, 2288479046, 13299552, 3659, 2542728933, 14380394, 1003, 2796973737, 18118583)
);



/********************************
月亮星历数据表
********************************/
//以下是月球黄经周期项及泊松项,精度0.5角秒,平均误差0.8角秒,近期精度更高一些
/******
1.黄经精度(角秒):0.5
2.黄纬精度(角秒):0.5
3.距离精度(千米):1
4.J2000.0时间最大偏移(世纪数):30
5.小数点增补位数:3

误差检测
1.测试点数N;2<N<10001，如500 :2300
2.偏移量rnd;0<=rnd<=1，如0.3 :0.2
    最大      平均
经  0.468217  0.080642 (角秒)
纬  0.346452  0.071540 (角秒)
距  0.724653  0.153055 (千米)
实际最大误差值大约为平均误差的6倍。
******/
//各坐标均是余弦项,各列单位:角秒,1,1,1e-4,1e-8,1e-8
var XL1 = new Array(
  new Array(
    //ML0
    new Array(
      22639.586, 0.78475822, 8328.691424623, 1.5229241, 25.0719, -0.123598, 4586.438, 0.1873974, 7214.06286536, -2.184756, -18.860, 0.08280, 2369.914, 2.5429520, 15542.75428998, -0.661832, 6.212, -0.04080, 769.026, 3.140313, 16657.38284925, 3.04585, 50.144, -0.2472, 666.418, 1.527671, 628.30195521, -0.02664, 0.062, -0.0054, 411.596, 4.826607, 16866.9323150, -1.28012, -1.07, -0.0059, 211.656, 4.115028, -1114.6285593, -3.70768, -43.93, 0.2064, 205.436, 0.230523, 6585.7609101, -2.15812, -18.92, 0.0882, 191.956, 4.898507, 23871.4457146, 0.86109, 31.28, -0.164, 164.729, 2.586078, 14914.4523348, -0.6352, 6.15, -0.035, 147.321, 5.45530, -7700.3894694, -1.5496, -25.01, 0.118, 124.988, 0.48608, 7771.3771450, -0.3309, 3.11, -0.020, 109.380, 3.88323, 8956.9933798, 1.4963, 25.13, -0.129, 55.177, 5.57033, -1324.1780250, 0.6183, 7.3, -0.035, 45.100, 0.89898, 25195.623740, 0.2428, 24.0, -0.129, 39.533, 3.81213, -8538.240890, 2.8030, 26.1, -0.118, 38.430, 4.30115, 22756.817155, -2.8466, -12.6, 0.042, 36.124, 5.49587, 24986.074274, 4.5688, 75.2, -0.371, 30.773, 1.94559, 14428.125731, -4.3695, -37.7, 0.166, 28.397, 3.28586, 7842.364821, -2.2114, -18.8, 0.077, 24.358, 5.64142, 16171.056245, -0.6885, 6.3, -0.046, 18.585, 4.41371, -557.314280, -1.8538, -22.0, 0.10, 17.954, 3.58454, 8399.679100, -0.3576, 3.2, -0.03, 14.530, 4.9416, 23243.143759, 0.888, 31.2, -0.16, 14.380, 0.9709, 32200.137139, 2.384, 56.4, -0.29, 14.251, 5.7641, -2.301200, 1.523, 25.1, -0.12, 13.899, 0.3735, 31085.508580, -1.324, 12.4, -0.08, 13.194, 1.7595, -9443.319984, -5.231, -69.0, 0.33, 9.679, 3.0997, -16029.080894, -3.072, -50.1, 0.24, 9.366, 0.3016, 24080.995180, -3.465, -19.9, 0.08, 8.606, 4.1582, -1742.930514, -3.681, -44.0, 0.21, 8.453, 2.8416, 16100.068570, 1.192, 28.2, -0.14, 8.050, 2.6292, 14286.150380, -0.609, 6.1, -0.03, 7.630, 6.2388, 17285.684804, 3.019, 50.2, -0.25, 7.447, 1.4845, 1256.603910, -0.053, 0.1, -0.01, 7.371, 0.2736, 5957.458955, -2.131, -19.0, 0.09, 7.063, 5.6715, 33.757047, -0.308, -3.6, 0.02, 6.383, 4.7843, 7004.513400, 2.141, 32.4, -0.16, 5.742, 2.6572, 32409.686605, -1.942, 5, -0.05, 4.374, 4.3443, 22128.51520, -2.820, -13, 0.05, 3.998, 3.2545, 33524.31516, 1.766, 49, -0.25, 3.210, 2.2443, 14985.44001, -2.516, -16, 0.06, 2.915, 1.7138, 24499.74767, 0.834, 31, -0.17, 2.732, 1.9887, 13799.82378, -4.343, -38, 0.17, 2.568, 5.4122, -7072.08751, -1.576, -25, 0.11, 2.521, 3.2427, 8470.66678, -2.238, -19, 0.07, 2.489, 4.0719, -486.32660, -3.734, -44, 0.20, 2.146, 5.6135, -1952.47998, 0.645, 7, -0.03, 1.978, 2.7291, 39414.20000, 0.199, 37, -0.21, 1.934, 1.5682, 33314.76570, 6.092, 100, -0.5, 1.871, 0.4166, 30457.20662, -1.297, 12, -0.1, 1.753, 2.0582, -8886.00570, -3.38, -47, 0.2, 1.437, 2.386, -695.87607, 0.59, 7, 0, 1.373, 3.026, -209.54947, 4.33, 51, -0.2, 1.262, 5.940, 16728.37052, 1.17, 28, -0.1, 1.224, 6.172, 6656.74859, -4.04, -41, 0.2, 1.187, 5.873, 6099.43431, -5.89, -63, 0.3, 1.177, 1.014, 31571.83518, 2.41, 56, -0.3, 1.162, 3.840, 9585.29534, 1.47, 25, -0.1, 1.143, 5.639, 8364.73984, -2.18, -19, 0.1, 1.078, 1.229, 70.98768, -1.88, -22, 0.1, 1.059, 3.326, 40528.82856, 3.91, 81, -0.4, 0.990, 5.013, 40738.37803, -0.42, 30, -0.2, 0.948, 5.687, -17772.01141, -6.75, -94, 0.5, 0.876, 0.298, -0.35232, 0, 0, 0, 0.822, 2.994, 393.02097, 0, 0, 0, 0.788, 1.836, 8326.39022, 3.05, 50, -0.2, 0.752, 4.985, 22614.84180, 0.91, 31, -0.2, 0.740, 2.875, 8330.99262, 0, 0, 0, 0.669, 0.744, -24357.77232, -4.60, -75, 0.4, 0.644, 1.314, 8393.12577, -2.18, -19, 0.1, 0.639, 5.888, 575.33849, 0, 0, 0, 0.635, 1.116, 23385.11911, -2.87, -13, 0, 0.584, 5.197, 24428.75999, 2.71, 53, -0.3, 0.583, 3.513, -9095.55517, 0.95, 4, 0, 0.572, 6.059, 29970.88002, -5.03, -32, 0.1, 0.565, 2.960, 0.32863, 1.52, 25, -0.1, 0.561, 4.001, -17981.56087, -2.43, -43, 0.2, 0.557, 0.529, 7143.07519, -0.30, 3, 0, 0.546, 2.311, 25614.37623, 4.54, 75, -0.4, 0.536, 4.229, 15752.30376, -4.99, -45, 0.2, 0.493, 3.316, -8294.9344, -1.83, -29, 0.1, 0.491, 1.744, 8362.4485, 1.21, 21, -0.1, 0.478, 1.803, -10071.6219, -5.20, -69, 0.3, 0.454, 0.857, 15333.2048, 3.66, 57, -0.3, 0.445, 2.071, 8311.7707, -2.18, -19, 0.1, 0.426, 0.345, 23452.6932, -3.44, -20, 0.1, 0.420, 4.941, 33733.8646, -2.56, -2, 0, 0.413, 1.642, 17495.2343, -1.31, -1, 0, 0.404, 1.458, 23314.1314, -0.99, 9, -0.1, 0.395, 2.132, 38299.5714, -3.51, -6, 0, 0.382, 2.700, 31781.3846, -1.92, 5, 0, 0.375, 4.827, 6376.2114, 2.17, 32, -0.2, 0.361, 3.867, 16833.1753, -0.97, 3, 0, 0.358, 5.044, 15056.4277, -4.40, -38, 0.2, 0.350, 5.157, -8257.7037, -3.40, -47, 0.2, 0.344, 4.233, 157.7344, 0, 0, 0, 0.340, 2.672, 13657.8484, -0.58, 6, 0, 0.329, 5.610, 41853.0066, 3.29, 74, -0.4, 0.325, 5.895, -39.8149, 0, 0, 0, 0.309, 4.387, 21500.2132, -2.79, -13, 0.1, 0.302, 1.278, 786.0419, 0, 0, 0, 0.302, 5.341, -24567.3218, -0.27, -24, 0.1, 0.301, 1.045, 5889.8848, -1.57, -12, 0, 0.294, 4.201, -2371.2325, -3.65, -44, 0.2, 0.293, 3.704, 21642.1886, -6.55, -57, 0.2, 0.290, 4.069, 32828.4391, 2.36, 56, -0.3, 0.289, 3.472, 31713.8105, -1.35, 12, -0.1, 0.285, 5.407, -33.7814, 0.31, 4, 0, 0.283, 5.998, -16.9207, -3.71, -44, 0.2, 0.283, 2.772, 38785.8980, 0.23, 37, -0.2, 0.274, 5.343, 15613.7420, -2.54, -16, 0.1, 0.263, 3.997, 25823.9257, 0.22, 24, -0.1, 0.254, 0.600, 24638.3095, -1.61, 2, 0, 0.253, 1.344, 6447.1991, 0.29, 10, -0.1, 0.250, 0.887, 141.9754, -3.76, -44, 0.2, 0.247, 0.317, 5329.1570, -2.10, -19, 0.1, 0.245, 0.141, 36.0484, -3.71, -44, 0.2, 0.231, 2.287, 14357.1381, -2.49, -16, 0.1, 0.227, 5.158, 2.6298, 0, 0, 0, 0.219, 5.085, 47742.8914, 1.72, 63, -0.3, 0.211, 2.145, 6638.7244, -2.18, -19, 0.1, 0.201, 4.415, 39623.7495, -4.13, -14, 0, 0.194, 2.091, 588.4927, 0, 0, 0, 0.193, 3.057, -15400.7789, -3.10, -50, 0, 0.186, 5.598, 16799.3582, -0.72, 6, 0, 0.185, 3.886, 1150.6770, 0, 0, 0, 0.183, 1.619, 7178.0144, 1.52, 25, 0, 0.181, 2.635, 8328.3391, 1.52, 25, 0, 0.181, 2.077, 8329.0437, 1.52, 25, 0, 0.179, 3.215, -9652.8694, -0.90, -18, 0, 0.176, 1.716, -8815.0180, -5.26, -69, 0, 0.175, 5.673, 550.7553, 0, 0, 0, 0.170, 2.060, 31295.0580, -5.6, -39, 0, 0.167, 1.239, 7211.7617, -0.7, 6, 0, 0.165, 4.499, 14967.4158, -0.7, 6, 0, 0.164, 3.595, 15540.4531, 0.9, 31, 0, 0.164, 4.237, 522.3694, 0, 0, 0, 0.163, 4.633, 15545.0555, -2.2, -19, 0, 0.161, 0.478, 6428.0209, -2.2, -19, 0, 0.158, 2.03, 13171.5218, -4.3, -38, 0, 0.157, 2.28, 7216.3641, -3.7, -44, 0, 0.154, 5.65, 7935.6705, 1.5, 25, 0, 0.152, 0.46, 29828.9047, -1.3, 12, 0, 0.151, 1.19, -0.7113, 0, 0, 0, 0.150, 1.42, 23942.4334, -1.0, 9, 0, 0.144, 2.75, 7753.3529, 1.5, 25, 0, 0.137, 2.08, 7213.7105, -2.2, -19, 0, 0.137, 1.44, 7214.4152, -2.2, -19, 0, 0.136, 4.46, -1185.6162, -1.8, -22, 0, 0.136, 3.03, 8000.1048, -2.2, -19, 0, 0.134, 2.83, 14756.7124, -0.7, 6, 0, 0.131, 5.05, 6821.0419, -2.2, -19, 0, 0.128, 5.99, -17214.6971, -4.9, -72, 0, 0.127, 5.35, 8721.7124, 1.5, 25, 0, 0.126, 4.49, 46628.2629, -2.0, 19, 0, 0.125, 5.94, 7149.6285, 1.5, 25, 0, 0.124, 1.09, 49067.0695, 1.1, 55, 0, 0.121, 2.88, 15471.7666, 1.2, 28, 0, 0.111, 3.92, 41643.4571, 7.6, 125, -1, 0.110, 1.96, 8904.0299, 1.5, 25, 0, 0.106, 3.30, -18.0489, -2.2, -19, 0, 0.105, 2.30, -4.9310, 1.5, 25, 0, 0.104, 2.22, -6.5590, -1.9, -22, 0, 0.101, 1.44, 1884.9059, -0.1, 0, 0, 0.100, 5.92, 5471.1324, -5.9, -63, 0, 0.099, 1.12, 15149.7333, -0.7, 6, 0, 0.096, 4.73, 15508.9972, -0.4, 10, 0, 0.095, 5.18, 7230.9835, 1.5, 25, 0, 0.093, 3.37, 39900.5266, 3.9, 81, 0, 0.092, 2.01, 25057.0619, 2.7, 53, 0, 0.092, 1.21, -79.6298, 0, 0, 0, 0.092, 1.65, -26310.2523, -4.0, -68, 0, 0.091, 1.01, 42062.5561, -1.0, 23, 0, 0.090, 6.10, 29342.5781, -5.0, -32, 0, 0.090, 4.43, 15542.4020, -0.7, 6, 0, 0.090, 3.80, 15543.1066, -0.7, 6, 0, 0.089, 4.15, 6063.3859, -2.2, -19, 0, 0.086, 4.03, 52.9691, 0, 0, 0, 0.085, 0.49, 47952.4409, -2.6, 11, 0, 0.085, 1.60, 7632.8154, 2.1, 32, 0, 0.084, 0.22, 14392.0773, -0.7, 6, 0, 0.083, 6.22, 6028.4466, -4.0, -41, 0, 0.083, 0.63, -7909.9389, 2.8, 26, 0, 0.083, 5.20, -77.5523, 0, 0, 0, 0.082, 2.74, 8786.1467, -2.2, -19, 0, 0.080, 2.43, 9166.5428, -2.8, -26, 0, 0.080, 3.70, -25405.1732, 4.1, 27, 0, 0.078, 5.68, 48857.5200, 5.4, 106, -1, 0.077, 1.85, 8315.5735, -2.2, -19, 0, 0.075, 5.46, -18191.1103, 1.9, 8, 0, 0.075, 1.41, -16238.6304, 1.3, 1, 0, 0.074, 5.06, 40110.0761, -0.4, 30, 0, 0.072, 2.10, 64.4343, -3.7, -44, 0, 0.071, 2.17, 37671.2695, -3.5, -6, 0, 0.069, 1.71, 16693.4313, -0.7, 6, 0, 0.069, 3.33, -26100.7028, -8.3, -119, 1, 0.068, 1.09, 8329.4028, 1.5, 25, 0, 0.068, 3.62, 8327.9801, 1.5, 25, 0, 0.068, 2.41, 16833.1509, -1.0, 3, 0, 0.067, 3.40, 24709.2971, -3.5, -20, 0, 0.067, 1.65, 8346.7156, -0.3, 3, 0, 0.066, 2.61, 22547.2677, 1.5, 39, 0, 0.066, 3.50, 15576.5113, -1.0, 3, 0, 0.065, 5.76, 33037.9886, -2.0, 5, 0, 0.065, 4.58, 8322.1325, -0.3, 3, 0, 0.065, 6.20, 17913.9868, 3.0, 50, 0, 0.065, 1.50, 22685.8295, -1.0, 9, 0, 0.065, 2.37, 7180.3058, -1.9, -15, 0, 0.064, 1.06, 30943.5332, 2.4, 56, 0, 0.064, 1.89, 8288.8765, 1.5, 25, 0, 0.064, 4.70, 6.0335, 0.3, 4, 0, 0.063, 2.83, 8368.5063, 1.5, 25, 0, 0.063, 5.66, -2580.7819, 0.7, 7, 0, 0.062, 3.78, 7056.3285, -2.2, -19, 0, 0.061, 1.49, 8294.9100, 1.8, 29, 0, 0.061, 0.12, -10281.1714, -0.9, -18, 0, 0.061, 3.06, -8362.4729, -1.2, -21, 0, 0.061, 4.43, 8170.9571, 1.5, 25, 0, 0.059, 5.78, -13.1179, -3.7, -44, 0, 0.059, 5.97, 6625.5702, -2.2, -19, 0, 0.058, 5.01, -0.5080, -0.3, 0, 0, 0.058, 2.73, 7161.0938, -2.2, -19, 0, 0.057, 0.19, 7214.0629, -2.2, -19, 0, 0.057, 4.00, 22199.5029, -4.7, -35, 0, 0.057, 5.38, 8119.1420, 5.8, 76, 0, 0.056, 1.07, 7542.6495, 1.5, 25, 0, 0.056, 0.28, 8486.4258, 1.5, 25, 0, 0.054, 4.19, 16655.0816, 4.6, 75, 0, 0.053, 0.72, 7267.0320, -2.2, -19, 0, 0.053, 3.12, 12.6192, 0.6, 7, 0, 0.052, 2.99, -32896.013, -1.8, -49, 0, 0.052, 3.46, 1097.708, 0, 0, 0, 0.051, 5.37, -6443.786, -1.6, -25, 0, 0.051, 1.35, 7789.401, -2.2, -19, 0, 0.051, 5.83, 40042.502, 0.2, 38, 0, 0.051, 3.63, 9114.733, 1.5, 25, 0, 0.050, 1.51, 8504.484, -2.5, -22, 0, 0.050, 5.23, 16659.684, 1.5, 25, 0, 0.050, 1.15, 7247.820, -2.5, -23, 0, 0.047, 0.25, -1290.421, 0.3, 0, 0, 0.047, 4.67, -32686.464, -6.1, -100, 0, 0.047, 3.49, 548.678, 0, 0, 0, 0.047, 2.37, 6663.308, -2.2, -19, 0, 0.046, 0.98, 1572.084, 0, 0, 0, 0.046, 2.04, 14954.262, -0.7, 6, 0, 0.046, 3.72, 6691.693, -2.2, -19, 0, 0.045, 6.19, -235.287, 0, 0, 0, 0.044, 2.96, 32967.001, -0.1, 27, 0, 0.044, 3.82, -1671.943, -5.6, -66, 0, 0.043, 5.82, 1179.063, 0, 0, 0, 0.043, 0.07, 34152.617, 1.7, 49, 0, 0.043, 3.71, 6514.773, -0.3, 0, 0, 0.043, 5.62, 15.732, -2.5, -23, 0, 0.043, 5.80, 8351.233, -2.2, -19, 0, 0.042, 0.27, 7740.199, 1.5, 25, 0, 0.042, 6.14, 15385.020, -0.7, 6, 0, 0.042, 6.13, 7285.051, -4.1, -41, 0, 0.041, 1.27, 32757.451, 4.2, 78, 0, 0.041, 4.46, 8275.722, 1.5, 25, 0, 0.040, 0.23, 8381.661, 1.5, 25, 0, 0.040, 5.87, -766.864, 2.5, 29, 0, 0.040, 1.66, 254.431, 0, 0, 0, 0.040, 0.40, 9027.981, -0.4, 0, 0, 0.040, 2.96, 7777.936, 1.5, 25, 0, 0.039, 4.67, 33943.068, 6.1, 100, 0, 0.039, 3.52, 8326.062, 1.5, 25, 0, 0.039, 3.75, 21013.887, -6.5, -57, 0, 0.039, 5.60, 606.978, 0, 0, 0, 0.039, 1.19, 8331.321, 1.5, 25, 0, 0.039, 2.84, 7211.433, -2.2, -19, 0, 0.038, 0.67, 7216.693, -2.2, -19, 0, 0.038, 6.22, 25161.867, 0.6, 28, 0, 0.038, 4.40, 7806.322, 1.5, 25, 0, 0.038, 4.16, 9179.168, -2.2, -19, 0, 0.037, 4.73, 14991.999, -0.7, 6, 0, 0.036, 0.35, 67.514, -0.6, -7, 0, 0.036, 3.70, 25266.611, -1.6, 0, 0, 0.036, 5.39, 16328.796, -0.7, 6, 0, 0.035, 1.44, 7174.248, -2.2, -19, 0, 0.035, 5.00, 15684.730, -4.4, -38, 0, 0.035, 0.39, -15.419, -2.2, -19, 0, 0.035, 6.07, 15020.385, -0.7, 6, 0, 0.034, 6.01, 7371.797, -2.2, -19, 0, 0.034, 0.96, -16623.626, -3.4, -54, 0, 0.033, 6.24, 9479.368, 1.5, 25, 0, 0.033, 3.21, 23661.896, 5.2, 82, 0, 0.033, 4.06, 8311.418, -2.2, -19, 0, 0.033, 2.40, 1965.105, 0, 0, 0, 0.033, 5.17, 15489.785, -0.7, 6, 0, 0.033, 5.03, 21986.540, 0.9, 31, 0, 0.033, 4.10, 16691.140, 2.7, 46, 0, 0.033, 5.13, 47114.589, 1.7, 63, 0, 0.033, 4.45, 8917.184, 1.5, 25, 0, 0.033, 4.23, 2.078, 0, 0, 0, 0.032, 2.33, 75.251, 1.5, 25, 0, 0.032, 2.10, 7253.878, -2.2, -19, 0, 0.032, 3.11, -0.224, 1.5, 25, 0, 0.032, 4.43, 16640.462, -0.7, 6, 0, 0.032, 5.68, 8328.363, 0, 0, 0, 0.031, 5.32, 8329.020, 3.0, 50, 0, 0.031, 3.70, 16118.093, -0.7, 6, 0, 0.030, 3.67, 16721.817, -0.7, 6, 0, 0.030, 5.27, -1881.492, -1.2, -15, 0, 0.030, 5.72, 8157.839, -2.2, -19, 0, 0.029, 5.73, -18400.313, -6.7, -94, 0, 0.029, 2.76, 16.000, -2.2, -19, 0, 0.029, 1.75, 8879.447, 1.5, 25, 0, 0.029, 0.32, 8851.061, 1.5, 25, 0, 0.029, 0.90, 14704.903, 3.7, 57, 0, 0.028, 2.90, 15595.723, -0.7, 6, 0, 0.028, 5.88, 16864.631, 0.2, 24, 0, 0.028, 0.63, 16869.234, -2.8, -26, 0, 0.028, 4.04, -18609.863, -2.4, -43, 0, 0.027, 5.83, 6727.736, -5.9, -63, 0, 0.027, 6.12, 418.752, 4.3, 51, 0, 0.027, 0.14, 41157.131, 3.9, 81, 0, 0.026, 3.80, 15.542, 0, 0, 0, 0.026, 1.68, 50181.698, 4.8, 99, -1, 0.026, 0.32, 315.469, 0, 0, 0, 0.025, 5.67, 19.188, 0.3, 0, 0, 0.025, 3.16, 62.133, -2.2, -19, 0, 0.025, 3.76, 15502.939, -0.7, 6, 0, 0.025, 4.53, 45999.961, -2.0, 19, 0, 0.024, 3.21, 837.851, -4.4, -51, 0, 0.024, 2.82, 38157.596, 0.3, 37, 0, 0.024, 5.21, 15540.124, -0.7, 6, 0, 0.024, 0.26, 14218.576, 0, 13, 0, 0.024, 3.01, 15545.384, -0.7, 6, 0, 0.024, 1.16, -17424.247, -0.6, -21, 0, 0.023, 2.34, -67.574, 0.6, 7, 0, 0.023, 2.44, 18.024, -1.9, -22, 0, 0.023, 3.70, 469.400, 0, 0, 0, 0.023, 0.72, 7136.511, -2.2, -19, 0, 0.023, 4.50, 15582.569, -0.7, 6, 0, 0.023, 2.80, -16586.395, -4.9, -72, 0, 0.023, 1.51, 80.182, 0, 0, 0, 0.023, 1.09, 5261.583, -1.5, -12, 0, 0.023, 0.56, 54956.954, -0.5, 44, 0, 0.023, 4.01, 8550.860, -2.2, -19, 0, 0.023, 4.46, 38995.448, -4.1, -14, 0, 0.023, 3.82, 2358.126, 0, 0, 0, 0.022, 3.77, 32271.125, 0.5, 34, 0, 0.022, 0.82, 15935.775, -0.7, 6, 0, 0.022, 1.07, 24013.421, -2.9, -13, 0, 0.022, 0.40, 8940.078, -2.2, -19, 0, 0.022, 2.06, 15700.489, -0.7, 6, 0, 0.022, 4.27, 15124.002, -5.0, -45, 0, 0.021, 1.16, 56071.583, 3.2, 88, 0, 0.021, 5.58, 9572.189, -2.2, -19, 0, 0.020, 1.70, -17.273, -3.7, -44, 0, 0.020, 3.05, 214.617, 0, 0, 0, 0.020, 4.41, 8391.048, -2.2, -19, 0, 0.020, 5.95, 23869.145, 2.4, 56, 0, 0.020, 0.42, 40947.927, -4.7, -21, 0, 0.019, 1.39, 5818.897, 0.3, 10, 0, 0.019, 0.71, 23873.747, -0.7, 6, 0, 0.019, 2.81, 7291.615, -2.2, -19, 0, 0.019, 5.09, 8428.018, -2.2, -19, 0, 0.019, 4.14, 6518.187, -1.6, -12, 0, 0.019, 3.85, 21.330, 0, 0, 0, 0.018, 0.66, 14445.046, -0.7, 6, 0, 0.018, 1.65, 0.966, -4.0, -48, 0, 0.018, 5.64, -17143.709, -6.8, -94, 0, 0.018, 6.01, 7736.432, -2.2, -19, 0, 0.018, 2.74, 31153.083, -1.9, 5, 0, 0.018, 4.58, 6116.355, -2.2, -19, 0, 0.018, 2.28, 46.401, 0.3, 0, 0, 0.018, 3.80, 10213.597, 1.4, 25, 0, 0.018, 2.84, 56281.132, -1.1, 36, 0, 0.018, 3.53, 8249.062, 1.5, 25, 0, 0.017, 4.43, 20871.911, -3, -13, 0, 0.017, 4.44, 627.596, 0, 0, 0, 0.017, 1.85, 628.308, 0, 0, 0, 0.017, 1.19, 8408.321, 2, 25, 0, 0.017, 1.95, 7214.056, -2, -19, 0, 0.017, 1.57, 7214.070, -2, -19, 0, 0.017, 1.65, 13870.811, -6, -60, 0, 0.017, 0.30, 22.542, -4, -44, 0, 0.017, 2.62, -119.445, 0, 0, 0, 0.016, 4.87, 5747.909, 2, 32, 0, 0.016, 4.45, 14339.108, -1, 6, 0, 0.016, 1.83, 41366.680, 0, 30, 0, 0.016, 4.53, 16309.618, -3, -23, 0, 0.016, 2.54, 15542.754, -1, 6, 0, 0.016, 6.05, 1203.646, 0, 0, 0, 0.015, 5.2, 2751.147, 0, 0, 0, 0.015, 1.8, -10699.924, -5, -69, 0, 0.015, 0.4, 22824.391, -3, -20, 0, 0.015, 2.1, 30666.756, -6, -39, 0, 0.015, 2.1, 6010.417, -2, -19, 0, 0.015, 0.7, -23729.470, -5, -75, 0, 0.015, 1.4, 14363.691, -1, 6, 0, 0.015, 5.8, 16900.689, -2, 0, 0, 0.015, 5.2, 23800.458, 3, 53, 0, 0.015, 5.3, 6035.000, -2, -19, 0, 0.015, 1.2, 8251.139, 2, 25, 0, 0.015, 3.6, -8.860, 0, 0, 0, 0.015, 0.8, 882.739, 0, 0, 0, 0.015, 3.0, 1021.329, 0, 0, 0, 0.015, 0.6, 23296.107, 1, 31, 0, 0.014, 5.4, 7227.181, 2, 25, 0, 0.014, 0.1, 7213.352, -2, -19, 0, 0.014, 4.0, 15506.706, 3, 50, 0, 0.014, 3.4, 7214.774, -2, -19, 0, 0.014, 4.6, 6665.385, -2, -19, 0, 0.014, 0.1, -8.636, -2, -22, 0, 0.014, 3.1, 15465.202, -1, 6, 0, 0.014, 4.9, 508.863, 0, 0, 0, 0.014, 3.5, 8406.244, 2, 25, 0, 0.014, 1.3, 13313.497, -8, -82, 0, 0.014, 2.8, 49276.619, -3, 0, 0, 0.014, 0.1, 30528.194, -3, -10, 0, 0.013, 1.7, 25128.050, 1, 31, 0, 0.013, 2.9, 14128.405, -1, 6, 0, 0.013, 3.4, 57395.761, 3, 80, 0, 0.013, 2.7, 13029.546, -1, 6, 0, 0.013, 3.9, 7802.556, -2, -19, 0, 0.013, 1.6, 8258.802, -2, -19, 0, 0.013, 2.2, 8417.709, -2, -19, 0, 0.013, 0.7, 9965.210, -2, -19, 0, 0.013, 3.4, 50391.247, 0, 48, 0, 0.013, 3.0, 7134.433, -2, -19, 0, 0.013, 2.9, 30599.182, -5, -31, 0, 0.013, 3.6, -9723.857, 1, 0, 0, 0.013, 4.8, 7607.084, -2, -19, 0, 0.012, 0.8, 23837.689, 1, 35, 0, 0.012, 3.6, 4.409, -4, -44, 0, 0.012, 5.0, 16657.031, 3, 50, 0, 0.012, 4.4, 16657.735, 3, 50, 0, 0.012, 1.1, 15578.803, -4, -38, 0, 0.012, 6.0, -11.490, 0, 0, 0, 0.012, 1.9, 8164.398, 0, 0, 0, 0.012, 2.4, 31852.372, -4, -17, 0, 0.012, 2.4, 6607.085, -2, -19, 0, 0.012, 4.2, 8359.870, 0, 0, 0, 0.012, 0.5, 5799.713, -2, -19, 0, 0.012, 2.7, 7220.622, 0, 0, 0, 0.012, 4.3, -139.720, 0, 0, 0, 0.012, 2.3, 13728.836, -2, -16, 0, 0.011, 3.6, 14912.146, 1, 31, 0, 0.011, 4.7, 14916.748, -2, -19, 0),
    //ML1
    new Array(
      1.67680, 4.66926, 628.301955, -0.0266, 0.1, -0.005, 0.51642, 3.3721, 6585.760910, -2.158, -18.9, 0.09, 0.41383, 5.7277, 14914.452335, -0.635, 6.2, -0.04, 0.37115, 3.9695, 7700.389469, 1.550, 25.0, -0.12, 0.27560, 0.7416, 8956.993380, 1.496, 25.1, -0.13, 0.24599, 4.2253, -2.301200, 1.523, 25.1, -0.12, 0.07118, 0.1443, 7842.36482, -2.211, -19, 0.08, 0.06128, 2.4998, 16171.05625, -0.688, 6, 0, 0.04516, 0.443, 8399.67910, -0.36, 3, 0, 0.04048, 5.771, 14286.15038, -0.61, 6, 0, 0.03747, 4.626, 1256.60391, -0.05, 0, 0, 0.03707, 3.415, 5957.45895, -2.13, -19, 0.1, 0.03649, 1.800, 23243.14376, 0.89, 31, -0.2, 0.02438, 0.042, 16029.08089, 3.07, 50, -0.2, 0.02165, 1.017, -1742.93051, -3.68, -44, 0.2, 0.01923, 3.097, 17285.68480, 3.02, 50, -0.3, 0.01692, 1.280, 0.3286, 1.52, 25, -0.1, 0.01361, 0.298, 8326.3902, 3.05, 50, -0.2, 0.01293, 4.013, 7072.0875, 1.58, 25, -0.1, 0.01276, 4.413, 8330.9926, 0, 0, 0, 0.01270, 0.101, 8470.6668, -2.24, -19, 0.1, 0.01097, 1.203, 22128.5152, -2.82, -13, 0, 0.01088, 2.545, 15542.7543, -0.66, 6, 0, 0.00835, 0.190, 7214.0629, -2.18, -19, 0.1, 0.00734, 4.855, 24499.7477, 0.83, 31, -0.2, 0.00686, 5.130, 13799.8238, -4.34, -38, 0.2, 0.00631, 0.930, -486.3266, -3.73, -44, 0, 0.00585, 0.699, 9585.2953, 1.5, 25, 0, 0.00566, 4.073, 8328.3391, 1.5, 25, 0, 0.00566, 0.638, 8329.0437, 1.5, 25, 0, 0.00539, 2.472, -1952.4800, 0.6, 7, 0, 0.00509, 2.88, -0.7113, 0, 0, 0, 0.00469, 3.56, 30457.2066, -1.3, 12, 0, 0.00387, 0.78, -0.3523, 0, 0, 0, 0.00378, 1.84, 22614.8418, 0.9, 31, 0, 0.00362, 5.53, -695.8761, 0.6, 7, 0, 0.00317, 2.80, 16728.3705, 1.2, 28, 0, 0.00303, 6.07, 157.7344, 0, 0, 0, 0.00300, 2.53, 33.7570, -0.3, -4, 0, 0.00295, 4.16, 31571.8352, 2.4, 56, 0, 0.00289, 5.98, 7211.7617, -0.7, 6, 0, 0.00285, 2.06, 15540.4531, 0.9, 31, 0, 0.00283, 2.65, 2.6298, 0, 0, 0, 0.00282, 6.17, 15545.0555, -2.2, -19, 0, 0.00278, 1.23, -39.8149, 0, 0, 0, 0.00272, 3.82, 7216.3641, -3.7, -44, 0, 0.00270, 4.37, 70.9877, -1.9, -22, 0, 0.00256, 5.81, 13657.8484, -0.6, 6, 0, 0.00244, 5.64, -0.2237, 1.5, 25, 0, 0.00240, 2.96, 8311.7707, -2.2, -19, 0, 0.00239, 0.87, -33.7814, 0.3, 4, 0, 0.00216, 2.31, 15.9995, -2.2, -19, 0, 0.00186, 3.46, 5329.1570, -2.1, -19, 0, 0.00169, 2.40, 24357.772, 4.6, 75, 0, 0.00161, 5.80, 8329.403, 1.5, 25, 0, 0.00161, 5.20, 8327.980, 1.5, 25, 0, 0.00160, 4.26, 23385.119, -2.9, -13, 0, 0.00156, 1.26, 550.755, 0, 0, 0, 0.00155, 1.25, 21500.213, -2.8, -13, 0, 0.00152, 0.60, -16.921, -3.7, -44, 0, 0.00150, 2.71, -79.630, 0, 0, 0, 0.00150, 5.29, 15.542, 0, 0, 0, 0.00148, 1.06, -2371.232, -3.7, -44, 0, 0.00141, 0.77, 8328.691, 1.5, 25, 0, 0.00141, 3.67, 7143.075, -0.3, 0, 0, 0.00138, 5.45, 25614.376, 4.5, 75, 0, 0.00129, 4.90, 23871.446, 0.9, 31, 0, 0.00126, 4.03, 141.975, -3.8, -44, 0, 0.00124, 6.01, 522.369, 0, 0, 0, 0.00120, 4.94, -10071.622, -5.2, -69, 0, 0.00118, 5.07, -15.419, -2.2, -19, 0, 0.00107, 3.49, 23452.693, -3.4, -20, 0, 0.00104, 4.78, 17495.234, -1.3, 0, 0, 0.00103, 1.44, -18.049, -2.2, -19, 0, 0.00102, 5.63, 15542.402, -0.7, 6, 0, 0.00102, 2.59, 15543.107, -0.7, 6, 0, 0.00100, 4.11, -6.559, -1.9, -22, 0, 0.00097, 0.08, 15400.779, 3.1, 50, 0, 0.00096, 5.84, 31781.385, -1.9, 5, 0, 0.00094, 1.08, 8328.363, 0, 0, 0, 0.00094, 2.46, 16799.358, -0.7, 6, 0, 0.00094, 1.69, 6376.211, 2.2, 32, 0, 0.00093, 3.64, 8329.020, 3.0, 50, 0, 0.00093, 2.65, 16655.082, 4.6, 75, 0, 0.00090, 1.90, 15056.428, -4.4, -38, 0, 0.00089, 1.59, 52.969, 0, 0, 0, 0.00088, 2.02, -8257.704, -3.4, -47, 0, 0.00088, 3.02, 7213.711, -2.2, -19, 0, 0.00087, 0.50, 7214.415, -2.2, -19, 0, 0.00087, 0.49, 16659.684, 1.5, 25, 0, 0.00082, 5.64, -4.931, 1.5, 25, 0, 0.00079, 5.17, 13171.522, -4.3, -38, 0, 0.00076, 3.60, 29828.905, -1.3, 12, 0, 0.00076, 4.08, 24567.322, 0.3, 24, 0, 0.00076, 4.58, 1884.906, -0.1, 0, 0, 0.00073, 0.33, 31713.811, -1.4, 12, 0, 0.00073, 0.93, 32828.439, 2.4, 56, 0, 0.00071, 5.91, 38785.898, 0.2, 37, 0, 0.00069, 2.20, 15613.742, -2.5, -16, 0, 0.00066, 3.87, 15.732, -2.5, -23, 0, 0.00066, 0.86, 25823.926, 0.2, 24, 0, 0.00065, 2.52, 8170.957, 1.5, 25, 0, 0.00063, 0.18, 8322.132, -0.3, 0, 0, 0.00060, 5.84, 8326.062, 1.5, 25, 0, 0.00060, 5.15, 8331.321, 1.5, 25, 0, 0.00060, 2.18, 8486.426, 1.5, 25, 0, 0.00058, 2.30, -1.731, -4, -44, 0, 0.00058, 5.43, 14357.138, -2, -16, 0, 0.00057, 3.09, 8294.910, 2, 29, 0, 0.00057, 4.67, -8362.473, -1, -21, 0, 0.00056, 4.15, 16833.151, -1, 0, 0, 0.00054, 1.93, 7056.329, -2, -19, 0, 0.00054, 5.27, 8315.574, -2, -19, 0, 0.00052, 5.6, 8311.418, -2, -19, 0, 0.00052, 2.7, -77.552, 0, 0, 0, 0.00051, 4.3, 7230.984, 2, 25, 0, 0.00050, 0.4, -0.508, 0, 0, 0, 0.00049, 5.4, 7211.433, -2, -19, 0, 0.00049, 4.4, 7216.693, -2, -19, 0, 0.00049, 4.3, 16864.631, 0, 24, 0, 0.00049, 2.2, 16869.234, -3, -26, 0, 0.00047, 6.1, 627.596, 0, 0, 0, 0.00047, 5.0, 12.619, 1, 7, 0, 0.00045, 4.9, -8815.018, -5, -69, 0, 0.00044, 1.6, 62.133, -2, -19, 0, 0.00042, 2.9, -13.118, -4, -44, 0, 0.00042, 4.1, -119.445, 0, 0, 0, 0.00041, 4.3, 22756.817, -3, -13, 0, 0.00041, 3.6, 8288.877, 2, 25, 0, 0.00040, 0.5, 6663.308, -2, -19, 0, 0.00040, 1.1, 8368.506, 2, 25, 0, 0.00039, 4.1, 6443.786, 2, 25, 0, 0.00039, 3.1, 16657.383, 3, 50, 0, 0.00038, 0.1, 16657.031, 3, 50, 0, 0.00038, 3.0, 16657.735, 3, 50, 0, 0.00038, 4.6, 23942.433, -1, 9, 0, 0.00037, 4.3, 15385.020, -1, 6, 0, 0.00037, 5.0, 548.678, 0, 0, 0, 0.00036, 1.8, 7213.352, -2, -19, 0, 0.00036, 1.7, 7214.774, -2, -19, 0, 0.00035, 1.1, 7777.936, 2, 25, 0, 0.00035, 1.6, -8.860, 0, 0, 0, 0.00035, 4.4, 23869.145, 2, 56, 0, 0.00035, 2.0, 6691.693, -2, -19, 0, 0.00034, 1.3, -1185.616, -2, -22, 0, 0.00034, 2.2, 23873.747, -1, 6, 0, 0.00033, 2.0, -235.287, 0, 0, 0, 0.00033, 3.1, 17913.987, 3, 50, 0, 0.00033, 1.0, 8351.233, -2, -19, 0),
    //ML2
    new Array(0.004870, 4.6693, 628.30196, -0.027, 0, -0.01, 0.002280, 2.6746, -2.30120, 1.523, 25, -0.12, 0.001500, 3.372, 6585.76091, -2.16, -19, 0.1, 0.001200, 5.728, 14914.45233, -0.64, 6, 0, 0.001080, 3.969, 7700.38947, 1.55, 25, -0.1, 0.000800, 0.742, 8956.99338, 1.50, 25, -0.1, 0.000254, 6.002, 0.3286, 1.52, 25, -0.1, 0.000210, 0.144, 7842.3648, -2.21, -19, 0, 0.000180, 2.500, 16171.0562, -0.7, 6, 0, 0.000130, 0.44, 8399.6791, -0.4, 3, 0, 0.000126, 5.03, 8326.3902, 3.0, 50, 0, 0.000120, 5.77, 14286.1504, -0.6, 6, 0, 0.000118, 5.96, 8330.9926, 0, 0, 0, 0.000110, 1.80, 23243.1438, 0.9, 31, 0, 0.000110, 3.42, 5957.4590, -2.1, -19, 0, 0.000110, 4.63, 1256.6039, -0.1, 0, 0, 0.000099, 4.70, -0.7113, 0, 0, 0, 0.000070, 0.04, 16029.0809, 3.1, 50, 0, 0.000070, 5.14, 8328.3391, 1.5, 25, 0, 0.000070, 5.85, 8329.0437, 1.5, 25, 0, 0.000060, 1.02, -1742.9305, -3.7, -44, 0, 0.000060, 3.10, 17285.6848, 3.0, 50, 0, 0.000054, 5.69, -0.352, 0, 0, 0, 0.000043, 0.52, 15.542, 0, 0, 0, 0.000041, 2.03, 2.630, 0, 0, 0, 0.000040, 0.10, 8470.667, -2.2, -19, 0, 0.000040, 4.01, 7072.088, 1.6, 25, 0, 0.000036, 2.93, -8.860, -0.3, 0, 0, 0.000030, 1.20, 22128.515, -2.8, -13, 0, 0.000030, 2.54, 15542.754, -0.7, 6, 0, 0.000027, 4.43, 7211.762, -0.7, 6, 0, 0.000026, 0.51, 15540.453, 0.9, 31, 0, 0.000026, 1.44, 15545.055, -2.2, -19, 0, 0.000025, 5.37, 7216.364, -3.7, -44, 0),
    //ML3
    new Array(0.00001200, 1.041, -2.3012, 1.52, 25, -0.1, 0.00000170, 0.31, -0.711, 0, 0, 0)
  ),

  new Array( //精度1角秒
    //MB0
    new Array(18461.240, 0.05710892, 8433.466157492, -0.6400617, -0.5345, -0.00294, 1010.167, 2.412663, 16762.15758211, 0.88286, 24.537, -0.1265, 999.694, 5.440038, -104.77473287, 2.16299, 25.606, -0.1207, 623.652, 0.915047, 7109.28813249, -0.02177, 6.746, -0.0379, 199.484, 1.815303, 15647.5290228, -2.82482, -19.39, 0.0799, 166.574, 4.842677, -1219.4032921, -1.5447, -18.33, 0.086, 117.261, 4.17086, 23976.2204475, -1.3019, 5.68, -0.044, 61.912, 4.76822, 25090.8490067, 2.4058, 49.61, -0.250, 33.357, 3.27060, 15437.979557, 1.5012, 31.8, -0.161, 31.760, 1.51241, 8223.916692, 3.6859, 50.7, -0.244, 29.577, 0.95817, 6480.986177, 0.0049, 6.7, -0.032, 15.566, 2.4871, -9548.094717, -3.068, -43.4, 0.21, 15.122, 0.2432, 32304.911872, 0.221, 30.7, -0.17, 12.094, 4.0135, 7737.590088, -0.048, 6.8, -0.04, 8.868, 1.8584, 15019.227068, -2.798, -19.5, 0.09, 8.045, 5.3812, 8399.709110, -0.332, 3.1, -0.02, 7.959, 4.2140, 23347.918492, -1.275, 5.6, -0.04, 7.435, 4.8858, -1847.705247, -1.518, -18.4, 0.09, 6.731, 3.8274, -16133.855627, -0.910, -24.5, 0.12, 6.580, 2.6732, 14323.350998, -2.207, -12.1, 0.04, 6.460, 3.1556, 9061.768113, -0.667, -0.5, -0.01, 6.296, 0.1713, 25300.398472, -1.920, -1.6, -0.01, 5.632, 0.8000, 733.076688, -2.190, -26, 0.12, 5.368, 2.1140, 16204.843302, -0.971, 3, -0.02, 5.311, 5.5111, 17390.459537, 0.856, 25, -0.13, 5.076, 2.2553, 523.52722, 2.136, 26, -0.13, 4.840, 6.1830, -7805.16420, 0.613, 1, 0, 4.806, 5.1414, -662.08901, 0.309, 4, -0.02, 3.984, 0.8406, 33419.54043, 3.929, 75, -0.37, 3.674, 5.0288, 22652.04242, -0.684, 13, -0.08, 2.998, 5.9291, 31190.28331, -3.487, -13, 0.04, 2.799, 2.1842, -16971.70705, 3.443, 27, -0.11, 2.414, 3.5735, 22861.59189, -5.010, -38, 0.16, 2.186, 3.9424, -9757.64418, 1.258, 8, -0.03, 2.146, 5.6262, 23766.67098, 3.024, 57, -0.29, 1.766, 3.3137, 14809.67760, 1.528, 32, -0.2, 1.624, 2.6013, 7318.83760, -4.35, -44, 0.2, 1.581, 3.8680, 16552.60812, 5.21, 76, -0.4, 1.520, 2.599, 40633.60330, 1.74, 56, -0.3, 1.516, 0.132, -17876.78614, -4.59, -68, 0.3, 1.510, 3.927, 8399.68473, -0.33, 3, 0, 1.318, 4.914, 16275.83098, -2.85, -19, 0.1, 1.264, 0.986, 24604.52240, -1.33, 6, 0, 1.192, 2.001, 39518.97474, -1.96, 12, -0.1, 1.135, 0.286, 31676.60992, 0.25, 31, -0.2, 1.086, 1.001, 5852.68422, 0.03, 7, 0, 1.019, 2.527, 33629.08990, -0.40, 23, -0.1, 0.823, 0.086, 16066.28151, 1.47, 32, -0.2, 0.804, 1.957, -33.78706, 0.28, 4, 0, 0.803, 5.212, 16833.14526, -1.00, 3, 0, 0.793, 1.472, -24462.54705, -2.43, -50, 0.2, 0.791, 1.658, -591.10134, -1.57, -18, 0.1, 0.667, 4.470, 24533.53473, 0.55, 28, -0.1, 0.650, 2.530, -10176.39667, -3.04, -43, 0.2, 0.639, 1.583, 25719.15096, 2.38, 50, -0.3, 0.634, 0.318, 5994.65957, -3.73, -37, 0.2, 0.631, 2.147, 8435.76736, -2.16, -26, 0.1, 0.630, 1.109, 8431.16496, 0.88, 25, -0.1, 0.596, 2.716, 13695.04904, -2.18, -12, 0.1, 0.589, 1.214, 7666.60241, 1.83, 29, -0.1, 0.473, 1.101, 30980.7338, 0.84, 38, -0.2, 0.456, 0.116, -71.0177, 1.85, 22, -0.1, 0.430, 2.786, -8990.7804, -1.21, -21, 0.1, 0.416, 1.454, 16728.4005, 1.19, 28, -0.1, 0.415, 5.072, 22023.7405, -0.66, 13, -0.1, 0.383, 4.257, 22719.6165, -1.25, 6, 0, 0.352, 2.972, 14880.6653, -0.35, 10, -0.1, 0.339, 5.972, 30561.9814, -3.46, -13, 0, 0.329, 1.587, -18086.3356, -0.26, -17, 0.1, 0.326, 1.016, 8467.2232, -0.95, -4, 0, 0.315, 1.902, 14390.9251, -2.77, -20, 0.1, 0.313, 4.611, 8852.2186, 3.66, 51, -0.2, 0.305, 0.616, 6551.9739, -1.88, -15, 0.1, 0.301, 4.728, -7595.6147, -3.71, -51, 0.2, 0.299, 1.874, 7143.0452, -0.33, 3, 0, 0.291, 3.156, -1428.9528, 2.78, 33, -0.2, 0.269, 4.929, -2476.0072, -1.49, -18, 0.1, 0.263, 3.196, 41748.2319, 5.45, 100, -0.5, 0.254, 3.387, -1009.8538, -5.87, -70, 0.3, 0.245, 1.930, 32514.4613, -4.10, -20, 0.1, 0.237, 3.342, 32933.2138, 0.19, 31, -0.2, 0.214, 3.617, 22233.2899, -4.98, -38, 0.2, 0.213, 4.357, 47847.6662, -0.44, 37, -0.2, 0.206, 3.872, 23418.9062, -3.16, -16, 0.1, 0.172, 5.772, 14951.6530, -2.2, -12, 0, 0.158, 2.04, 38890.6728, -1.9, 12, 0, 0.146, 1.70, 32095.3624, 4.5, 82, 0, 0.145, 4.29, 40843.1528, -2.6, 5, 0, 0.139, 2.90, 7876.1519, -2.5, -23, 0, 0.138, 4.95, 48962.2947, 3.3, 81, 0, 0.134, 3.97, 8365.8920, -0.1, 7, 0, 0.134, 4.06, -26205.4776, -6.1, -94, 0, 0.130, 1.40, -8643.0156, 5.0, 52, 0, 0.129, 5.67, 23138.3690, 3.1, 57, 0, 0.124, 2.64, 40005.3013, 1.8, 56, 0, 0.118, 4.88, 41957.7813, 1.1, 49, 0, 0.113, 3.78, -15505.5537, -0.9, -24, 0, 0.113, 4.87, 16904.1329, -2.9, -19, 0, 0.113, 1.84, 23280.3444, -0.7, 13, 0, 0.110, 0.43, -17319.4719, -2.7, -47, 0, 0.105, 1.61, 37.2006, -1.6, -18, 0, 0.102, 1.28, 25161.8367, 0.5, 28, 0, 0.095, 0.76, 1361.3786, -2.2, -25, 0, 0.094, 0.50, 29866.1053, -2.9, -6, 0, 0.092, 6.22, 24881.2995, 6.7, 101, 0, 0.088, 3.99, -10385.9461, 1.3, 8, 0, 0.085, 4.71, 70.9933, -1.9, -22, 0, 0.084, 0.86, 15613.7720, -2.5, -16, 0, 0.081, 4.43, 21537.4139, -4.4, -31, 0, 0.080, 1.86, -8365.9521, 0, -7, 0, 0.080, 0, 16728.3762, 1.2, 28, 0, 0.079, 2.44, -8919.7928, -3.1, -43, 0, 0.078, 3.69, -452.5395, -4.0, -48, 0, 0.075, 5.40, -32791.2385, -4.0, -75, 0, 0.073, 5.80, -1185.6462, -1.9, -22, 0, 0.070, 3.46, 16759.8564, 2.4, 50, 0, 0.069, 3.36, 14181.3756, 1.6, 32, 0, 0.068, 4.50, 16764.4588, -0.6, -1, 0, 0.067, 4.74, 8446.0854, 0, 7, 0, 0.066, 5.86, 24185.7699, -5.6, -46, 0, 0.064, 0.54, 32862.2262, 2.1, 53, 0, 0.063, 2.44, 24394.9729, 3.0, 57, 0, 0.063, 1.77, 5785.1101, 0.6, 14, 0, 0.062, 2.64, 6690.5356, -4.3, -45, 0, 0.062, 2.21, 1151.8292, 2.1, 26, 0, 0.062, 3.94, 34047.8424, 3.9, 75, 0, 0.060, 1.40, 38404.3462, -5.7, -32, 0, 0.058, 0.33, 31048.3080, 0.3, 31, 0, 0.057, 3.11, 9690.0701, -0.7, 0, 0, 0.057, 1.14, 30352.4319, 0.9, 38, 0, 0.056, 6.00, 8504.4538, -2.5, -22, 0, 0.055, 5.47, 18018.7615, 0.8, 25, 0, 0.055, 0.17, -18505.0881, -4.6, -69, 0, 0.055, 0.76, -9129.3422, 1.2, 8, 0, 0.054, 5.70, 7947.1396, -4.4, -44, 0, 0.053, 0.36, 5366.358, -3.7, -37, 0, 0.052, 4.01, -68.726, -1.5, -18, 0, 0.051, 2.74, 31818.585, -3.5, -13, 0, 0.051, 0.98, 16798.206, -2.8, -19, 0, 0.050, 5.94, 8293.747, -0.3, 0, 0, 0.049, 1.52, 15090.215, -4.7, -41, 0, 0.048, 3.46, 39309.425, 2.4, 63, 0, 0.046, 3.21, 23942.463, -1.0, 9, 0, 0.046, 3.35, 7143.070, -0.3, 0, 0, 0.042, 3.76, 46733.038, -4.1, -7, 0, 0.042, 5.18, 8288.351, 0, 7, 0, 0.040, 3.37, 16795.915, 0.6, 21, 0, 0.039, 4.54, -1776.718, -3.4, -40, 0, 0.039, 0.04, 8439.500, -0.3, 0, 0, 0.037, 3.91, 8479.867, -0.3, 0, 0, 0.037, 2.86, 38194.797, -1.3, 19, 0, 0.036, 1.04, 5224.382, 0.1, 7, 0, 0.036, 3.57, 15995.294, 3.4, 54, 0, 0.036, 5.33, 23209.357, 1.2, 35, 0, 0.035, 1.02, 8452.654, -0.3, 0, 0, 0.035, 4.31, 8294.904, 1.8, 29, 0, 0.035, 2.76, 13066.747, -2.2, -12, 0, 0.034, 6.07, 15508.967, -0.4, 10, 0, 0.032, 1.89, -17529.021, 1.6, 0, 0, 0.031, 5.70, 41261.905, 1.7, 56, 0, 0.031, 5.33, 30075.655, -7.2, -57, 0, 0.031, 5.97, -40.340, -1.5, -18, 0, 0.030, 2.87, 6533.950, 0, 7, 0, 0.030, 0.36, 49171.844, -1.1, 30, 0, 0.030, 4.40, 47219.364, -0.4, 37, 0, 0.030, 0.39, 23489.894, -5.0, -38, 0, 0.029, 5.12, 21395.439, -0.6, 13, 0, 0.029, 2.62, 8715.153, -0.3, 0, 0, 0.029, 2.94, 16826.592, -2.8, -19, 0, 0.028, 6.23, 31747.598, -1.6, 9, 0, 0.028, 0.43, 56176.358, 1.1, 62, 0, 0.027, 2.32, 8792.706, -0.3, 0, 0, 0.026, 3.02, 14252.363, -0.3, 10, 0, 0.025, 5.10, 40147.277, -2.0, 12, 0, 0.025, 4.59, 8433.795, 0.9, 25, 0, 0.025, 4.95, 8433.138, -2.2, -26, 0, 0.025, 1.03, -9338.545, -7.4, -95, 0, 0.024, 0.68, 17180.910, 5.2, 76, 0, 0.024, 3.81, 25057.092, 2.7, 53, 0, 0.024, 6.02, 29933.679, -3.4, -13, 0, 0.024, 2.37, -15924.306, -5.2, -76, 0, 0.024, 3.46, 8681.372, 0, 7, 0, 0.023, 2.80, 7108.936, 0, 7, 0, 0.023, 2.17, 7109.640, 0, 7, 0, 0.023, 2.57, -10804.699, -3.0, -44, 0, 0.022, 1.21, 6323.246, 0, 7, 0, 0.022, 3.22, 8259.965, 0, 7, 0, 0.022, 1.97, 7106.987, 1.5, 32, 0, 0.022, 3.00, 7111.589, -1.5, -18, 0, 0.022, 1.22, 14532.900, -6.5, -63, 0, 0.021, 0.66, 5923.672, -1.8, -15, 0, 0.021, 0.69, 24047.208, -3.2, -16, 0, 0.020, 5.51, -26415.027, -1.8, -42, 0, 0.020, 3.70, 16745.237, -2.8, -19, 0, 0.020, 1.26, 7038.300, 1.9, 29, 0, 0.020, 5.78, 6716.267, 0, 7, 0, 0.020, 3.76, 7895.330, 0, 7, 0, 0.019, 0.44, -121.695, -1.5, -18, 0, 0.018, 2.16, 15576.541, -0.9, 0, 0, 0.018, 0.09, -17248.484, -4.6, -68, 0, 0.018, 6.14, -7176.862, 0.6, 0, 0, 0.018, 5.55, 50076.923, 7.0, 125, -1, 0.017, 2.47, 8257.674, 3, 47, 0, 0.017, 4.20, 31609.036, 1, 38, 0, 0.017, 0.50, 175.762, -4, -48, 0, 0.017, 3.20, -2057.255, 3, 33, 0),
    //MB1
    new Array(0.07430, 4.0998, 6480.98618, 0.005, 7, -0.03, 0.03043, 0.872, 7737.59009, -0.05, 7, 0, 0.02229, 5.000, 15019.22707, -2.80, -19, 0.1, 0.01999, 1.072, 23347.91849, -1.28, 6, 0, 0.01869, 1.744, -1847.70525, -1.52, -18, 0.1, 0.01696, 5.597, 16133.8556, 0.91, 24, -0.1, 0.01623, 0.014, 9061.7681, -0.67, 0, 0, 0.01419, 3.942, 733.0767, -2.19, -26, 0.1, 0.01338, 2.370, 17390.4595, 0.86, 25, -0.1, 0.01304, 5.633, 8399.6847, -0.33, 3, 0, 0.01279, 0.886, -523.5272, -2.14, -26, 0.1, 0.01215, 3.242, 7805.1642, -0.61, -1, 0, 0.01088, 3.686, 8435.7674, -2.16, -26, 0.1, 0.01088, 5.853, 8431.1650, 0.88, 25, -0.1, 0.00546, 4.143, 5852.6842, 0, 7, 0, 0.00443, 0.17, 14809.6776, 1.5, 32, 0, 0.00342, 2.24, 8399.7091, -0.3, 3, 0, 0.00330, 1.77, 16275.8310, -2.9, -19, 0, 0.00318, 4.13, 24604.5224, -1.3, 6, 0, 0.00296, 0.90, 7109.2881, 0, 7, 0, 0.00285, 3.43, 31676.6099, 0.2, 31, 0, 0.00207, 3.23, 16066.2815, 1.5, 32, 0, 0.00202, 2.07, 16833.1453, -1.0, 3, 0, 0.00202, 5.10, -33.7871, 0.3, 4, 0, 0.00200, 1.67, 24462.5471, 2.4, 50, 0, 0.00198, 4.80, -591.1013, -1.6, -18, 0, 0.00193, 1.12, 22719.6165, -1.2, 6, 0, 0.00164, 5.67, -10176.397, -3.0, -43, 0, 0.00161, 4.73, 25719.151, 2.4, 50, 0, 0.00158, 5.04, 14390.925, -2.8, -20, 0, 0.00149, 5.86, 13695.049, -2.2, -12, 0, 0.00135, 1.79, -2476.007, -1.5, -18, 0, 0.00121, 1.93, 16759.856, 2.4, 50, 0, 0.00117, 6.04, 16764.459, -0.6, 0, 0, 0.00104, 1.93, 22023.740, -0.7, 13, 0, 0.00085, 2.83, 30561.981, -3.5, -13, 0, 0.00079, 4.81, -8852.219, -3.7, -51, 0, 0.00076, 1.59, -7595.615, -3.7, -51, 0, 0.00075, 2.91, 8433.795, 0.9, 25, 0, 0.00075, 0.35, 8433.138, -2.2, -26, 0, 0.00073, 0.13, 70.993, -1.9, -22, 0, 0.00069, 1.70, 16728.376, 1.2, 28, 0, 0.00068, 0.83, 8365.892, -0.1, 7, 0, 0.00060, 0.20, 32933.214, 0.2, 31, 0, 0.00060, 0.31, 8446.085, 0, 7, 0),
    //MB2
    new Array(0.000220, 4.100, 6480.9862, 0, 7, 0, 0.000101, 5.24, 8435.7674, -2.2, -26, 0, 0.000101, 4.30, 8431.1650, 0.9, 25, 0, 0.000090, 0.87, 7737.5901, 0, 7, 0, 0.000060, 1.07, 23347.9185, -1.3, 6, 0, 0.000060, 5.00, 15019.2271, -2.8, -19, 0, 0.000050, 1.74, -1847.705, -1.5, -18, 0, 0.000050, 5.60, 16133.856, 0.9, 24, 0, 0.000050, 0.01, 9061.768, -0.7, 0, 0, 0.000040, 3.24, 7805.164, -0.6, 0, 0, 0.000040, 3.94, 733.077, -2.2, -26, 0, 0.000040, 0.89, -523.527, -2.1, -26, 0)
  ),

  new Array( //精度1千米
    //MR0
    new Array(385000.510, 0, 0, 0, 0, 0, 20905.354, 5.4971472, 8328.691424623, 1.522924, 25.0719, -0.12360, 3699.111, 4.8997864, 7214.06286536, -2.184756, -18.860, 0.0828, 2955.967, 0.972156, 15542.75428998, -0.66183, 6.212, -0.0408, 569.925, 1.569516, 16657.3828492, 3.04585, 50.14, -0.2472, 246.158, 5.68582, -1114.6285593, -3.7077, -43.93, 0.206, 204.586, 1.01528, 14914.4523348, -0.6352, 6.15, -0.035, 170.733, 3.32771, 23871.4457146, 0.8611, 31.28, -0.164, 152.138, 4.94291, 6585.7609101, -2.1581, -18.92, 0.088, 129.620, 0.74291, -7700.3894694, -1.5496, -25.01, 0.118, 108.743, 5.19847, 7771.3771450, -0.3309, 3.1, -0.020, 104.755, 2.31243, 8956.993380, 1.4963, 25.1, -0.129, 79.661, 5.38293, -8538.240890, 2.8030, 26.1, -0.118, 48.888, 6.24006, 628.301955, -0.0266, 0.1, -0.005, 34.783, 2.73035, 22756.817155, -2.847, -12.6, 0.04, 30.824, 4.0706, 16171.056245, -0.688, 6.3, -0.05, 24.208, 1.7151, 7842.364821, -2.211, -18.8, 0.08, 23.210, 3.9251, 24986.074274, 4.569, 75.2, -0.37, 21.636, 0.3748, 14428.125731, -4.370, -37.7, 0.17, 16.675, 2.0137, 8399.679100, -0.358, 3.2, -0.03, 14.403, 3.3303, -9443.319984, -5.231, -69.0, 0.33, 12.831, 3.3708, 23243.143759, 0.888, 31.2, -0.16, 11.650, 5.0859, 31085.508580, -1.324, 12, -0.08, 10.445, 5.6833, 32200.13714, 2.384, 56, -0.29, 10.321, 0.8579, -1324.17803, 0.618, 7, -0.03, 10.056, 5.7290, -1742.93051, -3.681, -44, 0.21, 9.884, 1.0584, 14286.15038, -0.609, 6, -0.03, 8.752, 4.7856, -9652.86945, -0.905, -18, 0.09, 8.379, 5.9845, -557.31428, -1.854, -22, 0.10, 7.003, 4.6705, -16029.08089, -3.072, -50, 0.24, 6.322, 1.2708, 16100.06857, 1.192, 28, -0.14, 5.751, 4.6680, 17285.68480, 3.019, 50, -0.25, 4.950, 4.9860, 5957.45895, -2.131, -19, 0.09, 4.421, 4.5969, -209.54947, 4.326, 51, -0.24, 4.131, 3.2135, 7004.51340, 2.141, 32, -0.16, 3.958, 2.7735, 22128.51520, -2.820, -13, 0.05, 3.258, 0.6735, 14985.44001, -2.52, -16, 0.1, 3.148, 0.114, 16866.93231, -1.28, -1, 0, 2.616, 0.143, 24499.74767, 0.83, 31, -0.2, 2.354, 1.672, 8470.66678, -2.24, -19, 0.1, 2.117, 0.700, -7072.08751, -1.58, -25, 0.1, 1.897, 0.418, 13799.82378, -4.34, -38, 0.2, 1.739, 3.629, -8886.00570, -3.38, -47, 0.2, 1.571, 5.129, 30457.20662, -1.30, 12, -0.1, 1.423, 1.158, 39414.20000, 0.20, 37, -0.2, 1.419, 6.171, 23314.13143, -0.99, 9, -0.1, 1.166, 2.269, 9585.29534, 1.47, 25, -0.1, 1.117, 6.281, 33314.76570, 6.09, 100, -0.5, 1.066, 6.197, 1256.60391, -0.05, 0, 0, 1.059, 4.068, 8364.73984, -2.18, -19, 0.1, 0.933, 4.369, 16728.3705, 1.17, 28, -0.1, 0.862, 4.601, 6656.7486, -4.04, -41, 0.2, 0.851, 2.800, 70.9877, -1.88, -22, 0.1, 0.849, 5.726, 31571.8352, 2.41, 56, -0.3, 0.796, 5.084, -9095.5552, 0.95, 4, 0, 0.779, 0.975, -17772.0114, -6.75, -94, 0.5, 0.774, 2.658, 15752.3038, -4.99, -45, 0.2, 0.728, 0.266, 8326.3902, 3.05, 50, -0.2, 0.683, 1.304, 8330.9926, 0, 0, 0, 0.670, 1.756, 40528.8286, 3.91, 81, -0.4, 0.658, 3.414, 22614.8418, 0.91, 31, -0.2, 0.657, 0.901, -1952.4800, 0.64, 7, 0, 0.598, 6.026, 8393.1258, -2.18, -19, 0.1, 0.596, 5.014, 24080.9952, -3.46, -20, 0.1, 0.579, 5.829, 23385.1191, -2.87, -13, 0, 0.514, 4.302, 6099.4343, -5.89, -63, 0.3, 0.508, 1.830, 14218.5763, -0.04, 13, -0.1, 0.498, 5.242, 7143.0752, -0.30, 3, 0, 0.495, 3.373, -10071.6219, -5.20, -69, 0.3, 0.473, 2.430, -17981.5609, -2.43, -43, 0.2, 0.456, 4.887, -8294.9344, -1.83, -29, 0.1, 0.453, 0.173, 8362.4485, 1.21, 21, -0.1, 0.423, 4.489, 29970.8800, -5.03, -32, 0.1, 0.422, 2.315, -24357.7723, -4.60, -75, 0.4, 0.411, 1.102, 13657.8484, -0.58, 6, 0, 0.410, 0.500, 8311.7707, -2.18, -19, 0.1, 0.379, 3.626, 24428.7600, 2.71, 53, 0, 0.355, 0.740, 25614.3762, 4.54, 75, 0, 0.343, 5.772, -2371.2325, -3.7, -44, 0, 0.335, 0.857, 9166.5428, -2.8, -26, 0, 0.332, 0.444, -8257.7037, -3.4, -47, 0, 0.323, 4.829, -10281.1714, -0.9, -18, 0, 0.322, 5.758, 5889.8848, -1.6, -12, 0, 0.287, 0.56, 38299.5714, -3.5, -6, 0, 0.284, 5.57, 15333.2048, 3.7, 57, 0, 0.279, 2.82, 21500.2132, -2.8, -13, 0, 0.256, 0.72, 14357.1381, -2.5, -16, 0, 0.248, 2.20, -7909.9389, 2.8, 26, 0, 0.245, 1.90, 31713.8105, -1.4, 12, 0, 0.237, 3.47, 15056.4277, -4.4, -38, 0, 0.213, 3.77, 15613.7420, -2.5, -16, 0, 0.213, 2.50, 32828.4391, 2.4, 56, 0, 0.209, 3.26, 6376.2114, 2.2, 32, 0, 0.205, 2.93, 14967.4158, -0.7, 6, 0, 0.205, 2.02, 15540.4531, 0.9, 31, 0, 0.204, 3.06, 15545.0555, -2.2, -19, 0, 0.203, 1.20, 38785.8980, 0.2, 37, 0, 0.201, 6.06, 6447.1991, 0.3, 10, 0, 0.186, 6.13, -16238.6304, 1.3, 1, 0, 0.183, 2.13, 21642.1886, -6.6, -57, 0, 0.169, 3.29, -8815.0180, -5.3, -69, 0, 0.167, 1.06, 8328.3391, 1.5, 25, 0, 0.167, 0.51, 8329.0437, 1.5, 25, 0, 0.167, 1.26, 14756.7124, -0.7, 6, 0, 0.158, 0.07, 17495.2343, -1.3, -1, 0, 0.157, 0.57, 6638.7244, -2.2, -19, 0, 0.157, 6.21, 22685.8295, -1.0, 9, 0, 0.148, 5.03, 5329.1570, -2.1, -19, 0, 0.148, 4.03, 16799.3582, -0.7, 6, 0, 0.145, 0.05, 7178.0144, 1.5, 25, 0, 0.144, 5.64, -486.3266, -3.7, -44, 0, 0.139, 3.51, 47742.8914, 1.7, 63, 0, 0.138, 4.07, 7935.6705, 1.5, 25, 0, 0.136, 4.63, -15400.7789, -3.1, -50, 0, 0.136, 3.96, -695.8761, 0.6, 7, 0, 0.135, 5.95, 7211.7617, -0.7, 6, 0, 0.128, 5.17, 29828.9047, -1.3, 12, 0, 0.127, 1.18, 7753.3529, 1.5, 25, 0, 0.127, 0.71, 7216.3641, -3.7, -44, 0, 0.124, 5.83, 15149.7333, -0.7, 6, 0, 0.121, 1.46, 8000.1048, -2.2, -19, 0, 0.120, 3.78, 8721.7124, 1.5, 25, 0, 0.116, 5.19, 6428.0209, -2.2, -19, 0, 0.114, 2.89, -1185.6162, -1.8, -22, 0, 0.112, 2.85, 15542.4020, -0.7, 6, 0, 0.112, 2.23, 15543.1066, -0.7, 6, 0, 0.110, 0.51, 7213.7105, -2.2, -19, 0, 0.110, 6.15, 7214.4152, -2.2, -19, 0, 0.110, 1.31, 15471.7666, 1.2, 28, 0, 0.109, 2.46, 141.9754, -3.8, -44, 0, 0.108, 0.46, 13171.5218, -4.3, -38, 0, 0.108, 6.13, 23942.4334, -1.0, 9, 0, 0.107, 3.15, 15508.9972, -0.4, 10, 0, 0.105, 0.39, 8904.030, 1.5, 25, 0, 0.105, 4.93, 14392.077, -0.7, 6, 0, 0.103, 2.47, 25195.624, 0.2, 24, 0, 0.101, 3.48, 6821.042, -2.2, -19, 0, 0.099, 4.37, 7149.629, 1.5, 25, 0, 0.099, 1.27, -17214.697, -4.9, -72, 0, 0.096, 1.93, 15576.511, -1.0, 0, 0, 0.086, 2.92, 46628.263, -2.0, 19, 0, 0.085, 6.22, 8504.484, -2.5, -22, 0, 0.080, 3.40, -2438.807, -3.1, -37, 0, 0.080, 1.17, 8786.147, -2.2, -19, 0, 0.077, 3.61, 7230.984, 1.5, 25, 0, 0.071, 0.28, 8315.574, -2.2, -19, 0, 0.067, 4.53, 29342.578, -5.0, -32, 0, 0.065, 2.24, 31642.823, 0.5, 34, 0, 0.063, 5.80, 8329.403, 1.5, 25, 0, 0.063, 2.05, 8327.980, 1.5, 25, 0, 0.062, 0.08, 8346.716, -0.3, 0, 0, 0.061, 4.85, 36.048, -3.7, -44, 0, 0.061, 2.58, 6063.386, -2.2, -19, 0, 0.061, 4.30, -766.864, 2.5, 29, 0, 0.060, 3.01, 8322.132, -0.3, 0, 0, 0.059, 0.44, 25057.062, 2.7, 53, 0, 0.059, 0.31, 8288.877, 1.5, 25, 0, 0.059, 2.35, 41643.457, 7.6, 125, -1, 0.059, 1.26, 8368.506, 1.5, 25, 0, 0.058, 1.80, 39900.527, 3.9, 81, 0, 0.058, 1.87, 13590.274, 0, 13, 0, 0.057, 0.47, 14954.262, -0.7, 6, 0, 0.057, 6.20, 8294.910, 1.8, 29, 0, 0.056, 4.63, -8362.473, -1.2, -21, 0, 0.055, 2.86, 8170.957, 1.5, 25, 0, 0.055, 0.03, 7632.815, 2.1, 32, 0, 0.053, 0.80, 7180.306, -1.9, -15, 0, 0.053, 4.64, 6028.447, -4.0, -41, 0, 0.053, 4.57, 15385.020, -0.7, 6, 0, 0.052, 0.60, 37671.269, -3.5, -6, 0, 0.052, 4.99, 8486.426, 1.5, 25, 0, 0.051, 4.62, 17913.987, 3.0, 50, 0, 0.050, 1.64, 837.851, -4.4, -51, 0, 0.049, 5.79, 7542.649, 1.5, 25, 0, 0.049, 2.06, 9114.733, 1.5, 25, 0, 0.049, 2.21, 7056.329, -2.2, -19, 0, 0.049, 4.90, 7214.063, -2.2, -19, 0, 0.048, 5.39, -1671.943, -5.6, -66, 0, 0.047, 4.90, -26100.703, -8.3, -119, 1, 0.047, 1.60, -9024.567, -0.9, -18, 0, 0.046, 1.16, 7161.094, -2.2, -19, 0, 0.046, 5.77, 30943.533, 2.4, 56, 0, 0.046, 2.43, 22199.503, -4.7, -35, 0, 0.046, 3.16, 14991.999, -0.7, 6, 0, 0.044, 4.11, 48857.520, 5.4, 106, -1, 0.044, 4.39, 6625.570, -2.2, -19, 0, 0.044, 6.06, 7789.401, -2.2, -19, 0, 0.043, 0.14, 16693.431, -0.7, 6, 0, 0.043, 4.50, 15020.385, -0.7, 6, 0, 0.043, 4.35, 5471.132, -5.9, -63, 0, 0.043, 4.32, 575.338, 0, 0, 0, 0.043, 5.43, 7267.032, -2.2, -19, 0, 0.043, 3.82, 16328.796, -0.7, 6, 0, 0.042, 2.73, -17424.247, -0.6, -21, 0, 0.041, 3.60, 15489.785, -0.7, 6, 0, 0.040, 2.62, 16655.082, 4.6, 75, 0, 0.040, 4.23, 8351.233, -2.2, -19, 0, 0.039, 0.66, -6443.786, -1.6, -25, 0, 0.039, 2.13, 16118.093, -0.7, 6, 0, 0.039, 5.86, 7247.820, -2.5, -23, 0, 0.038, 4.56, 7285.051, -4.1, -41, 0, 0.038, 2.59, 9179.168, -2.2, -19, 0, 0.038, 1.42, 393.021, 0, 0, 0, 0.038, 4.94, 8381.661, 1.5, 25, 0, 0.037, 5.06, 23452.693, -3.4, -20, 0, 0.037, 5.11, 9027.981, -0.4, 0, 0, 0.037, 4.98, 7740.199, 1.5, 25, 0, 0.037, 3.66, 16659.684, 1.5, 25, 0, 0.037, 2.89, 8275.722, 1.5, 25, 0, 0.037, 4.26, 40042.502, 0.2, 38, 0, 0.036, 1.95, 8326.062, 1.5, 25, 0, 0.036, 5.90, 8331.321, 1.5, 25, 0, 0.035, 1.33, 15595.723, -0.7, 6, 0, 0.035, 1.39, 7777.936, 2, 25, 0, 0.035, 0.80, 6663.308, -2, -19, 0, 0.035, 0.53, 64.434, -4, -44, 0, 0.034, 2.15, 6691.693, -2, -19, 0, 0.034, 1.90, -8467.253, 1, 0, 0, 0.033, 2.83, 7806.322, 2, 25, 0, 0.033, 4.67, 9479.368, 2, 25, 0, 0.033, 1.41, 418.752, 4, 51, 0),
    //MR1
    new Array(0.5139, 4.1569, 14914.452335, -0.635, 6.2, -0.04, 0.3824, 1.8013, 6585.760910, -2.158, -19, 0.09, 0.3265, 2.3987, 7700.38947, 1.550, 25, -0.12, 0.2640, 5.4540, 8956.99338, 1.496, 25, -0.13, 0.1230, 3.0985, 628.30196, -0.027, 0, 0, 0.0775, 0.929, 16171.05625, -0.69, 6, 0, 0.0607, 4.857, 7842.36482, -2.21, -19, 0.1, 0.0497, 4.200, 14286.15038, -0.61, 6, 0, 0.0419, 5.155, 8399.67910, -0.36, 3, 0, 0.0322, 0.229, 23243.1438, 0.89, 31, -0.2, 0.0253, 2.587, -1742.9305, -3.68, -44, 0.2, 0.0249, 1.844, 5957.4590, -2.13, -19, 0.1, 0.0176, 4.754, 16029.0809, 3.07, 50, -0.2, 0.0145, 1.526, 17285.6848, 3.02, 50, -0.3, 0.0137, 1.004, 15542.7543, -0.66, 6, 0, 0.0126, 5.010, 8326.3902, 3.05, 50, 0, 0.0119, 4.814, 8470.6668, -2.24, -19, 0, 0.0118, 2.843, 8330.9926, 0, 0, 0, 0.0107, 2.442, 7072.0875, 1.6, 25, 0, 0.0099, 5.92, 22128.5152, -2.8, -13, 0, 0.0066, 3.28, 24499.7477, 0.8, 31, 0, 0.0065, 4.90, 7214.0629, -2.2, -19, 0, 0.0059, 5.41, 9585.2953, 1.5, 25, 0, 0.0054, 3.06, 1256.6039, -0.1, 0, 0, 0.0052, 2.50, 8328.3391, 1.5, 25, 0, 0.0052, 5.35, 8329.0437, 1.5, 25, 0, 0.0048, 3.56, 13799.8238, -4.3, -38, 0, 0.0039, 1.99, 30457.2066, -1.3, 12, 0, 0.0035, 0.49, 15540.4531, 0.9, 31, 0, 0.0035, 4.60, 15545.0555, -2.2, -19, 0, 0.0033, 0.27, 22614.842, 0.9, 31, 0, 0.0031, 4.24, 13657.848, -0.6, 6, 0, 0.0023, 1.23, 16728.371, 1.2, 28, 0, 0.0023, 5.50, 8328.691, 1.5, 25, 0, 0.0023, 0, 0, 0, 0, 0, 0.0023, 4.41, 7211.762, -0.7, 6, 0, 0.0022, 1.39, 8311.771, -2.2, -19, 0, 0.0022, 2.25, 7216.364, -3.7, -44, 0, 0.0021, 5.94, 70.988, -1.9, -22, 0, 0.0021, 2.58, 31571.835, 2.4, 56, 0, 0.0017, 2.63, -2371.232, -3.7, -44, 0, 0.0016, 4.04, -1952.480, 0.6, 7, 0, 0.0015, 4.23, 8329.403, 1.5, 25, 0, 0.0015, 3.63, 8327.980, 1.5, 25, 0, 0.0015, 2.69, 23385.119, -2.9, -13, 0, 0.0014, 5.96, 21500.213, -2.8, -13, 0, 0.0013, 4.06, 15542.402, -0.7, 6, 0, 0.0013, 1.02, 15543.107, -0.7, 6, 0, 0.0013, 2.10, 7143.075, -0.3, 0, 0, 0.0012, 0.23, -10071.622, -5.2, -69, 0, 0.0011, 3.33, 23871.446, 1, 31, 0, 0.0011, 1.89, 5329.157, -2, -19, 0),
    //MR2
    new Array(0.001490, 4.157, 14914.45233, -0.64, 6, 0, 0.001110, 1.801, 6585.7609, -2.16, -19, 0.1, 0.000950, 2.399, 7700.3895, 1.55, 25, -0.1, 0.000770, 5.454, 8956.9934, 1.50, 25, -0.1, 0.000360, 3.098, 628.3020, 0, 0, 0, 0.000230, 0.93, 16171.0562, -0.7, 6, 0, 0.000180, 4.86, 7842.3648, -2.2, -19, 0, 0.000140, 4.20, 14286.1504, -0.6, 6, 0, 0.000120, 5.16, 8399.6791, -0.4, 0, 0, 0.000116, 3.46, 8326.390, 3.0, 50, 0, 0.000109, 4.39, 8330.993, 0, 0, 0, 0.000090, 0.23, 23243.144, 0.9, 31, 0)
  )

);




//=================================行星星历=========================================
//==================================================================================

var XL0_xzb = new Array( //行星星历修正表
  //经(角秒),纬(角秒), 距(10-6AU)
  -0.08631, +0.00039, -0.00008,  //水星
  -0.07447, +0.00006, +0.00017,  //金星
  -0.07135, -0.00026, -0.00176,  //火星
  -0.20239, +0.00273, -0.00347,  //木星
  -0.25486, +0.00276, +0.42926,  //土星
  +0.24588, +0.00345, -14.46266, //天王星
  -0.95116, +0.02481, +58.30651  //海王星
);


function XL0_calc(xt, zn, t, n) { //xt星体,zn坐标号,t儒略世纪数,n计算项数
  t /= 10; //转为儒略千年数
  var i, j, v = 0, tn = 1, c;
  var F = XL0[xt], n1, n2, N;
  var n0, pn = zn * 6 + 1, N0 = F[pn + 1] - F[pn]; //N0序列总数
  for (i = 0; i < 6; i++, tn *= t) {
    n1 = F[pn + i], n2 = F[pn + 1 + i], n0 = n2 - n1;
    if (!n0) continue;
    if (n < 0) N = n2;  //确定项数
    else { N = int2(3 * n * n0 / N0 + 0.5) + n1; if (i) N += 3; if (N > n2) N = n2; }
    for (j = n1, c = 0; j < N; j += 3) c += F[j] * Math.cos(F[j + 1] + t * F[j + 2]);
    v += c * tn;
  }
  v /= F[0];
  if (xt == 0) { //地球
    var t2 = t * t, t3 = t2 * t; //千年数的各次方
    if (zn == 0) v += (-0.0728 - 2.7702 * t - 1.1019 * t2 - 0.0996 * t3) / rad;
    if (zn == 1) v += (+0.0000 + 0.0004 * t + 0.0004 * t2 - 0.0026 * t3) / rad;
    if (zn == 2) v += (-0.0020 + 0.0044 * t + 0.0213 * t2 - 0.0250 * t3) / 1000000;
  } else { //其它行星
    var dv = XL0_xzb[(xt - 1) * 3 + zn];
    if (zn == 0) v += -3 * t / rad;
    if (zn == 2) v += dv / 1000000;
    else v += dv / rad;
  }
  return v;
}

function p_coord(xt, t, n1, n2, n3) { //xt星体,T儒略世纪数,TD
  var z = new Array();
  if (xt < 8) {
    z[0] = XL0_calc(xt, 0, t, n1);
    z[1] = XL0_calc(xt, 1, t, n2);
    z[2] = XL0_calc(xt, 2, t, n3);
  }
  if (xt == 8) { //冥王星
    z = pluto_coord(t);
    z = xyz2llr(z);
    z = HDllr_J2D(t, z, 'P03');
  }
  if (xt == 9) { //太阳
    z[0] = 0, z[1] = 0, z[2] = 0;
  }
  return z;
}

function e_coord(t, n1, n2, n3) { //返回地球坐标,t为世纪数
  var re = new Array();
  re[0] = XL0_calc(0, 0, t, n1);
  re[1] = XL0_calc(0, 1, t, n2);
  re[2] = XL0_calc(0, 2, t, n3);
  return re;
}

//=================================月亮星历--=======================================
//==================================================================================

function XL1_calc(zn, t, n) { //计算月亮
  var ob = XL1[zn];
  var i, j, F, N, v = 0, tn = 1, c;
  var t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t, tx = t - 10;
  if (zn == 0) {
    v += (3.81034409 + 8399.684730072 * t - 3.319e-05 * t2 + 3.11e-08 * t3 - 2.033e-10 * t4) * rad; //月球平黄经(弧度)
    v += 5028.792262 * t + 1.1124406 * t2 + 0.00007699 * t3 - 0.000023479 * t4 - 0.0000000178 * t5;  //岁差(角秒)
    if (tx > 0) v += -0.866 + 1.43 * tx + 0.054 * tx * tx; //对公元3000年至公元5000年的拟合,最大误差小于10角秒
  }
  t2 /= 1e4, t3 /= 1e8, t4 /= 1e8;
  n *= 6; if (n < 0) n = ob[0].length;
  for (i = 0; i < ob.length; i++, tn *= t) {
    F = ob[i];
    N = int2(n * F.length / ob[0].length + 0.5); if (i) N += 6; if (N >= F.length) N = F.length;
    for (j = 0, c = 0; j < N; j += 6) c += F[j] * Math.cos(F[j + 1] + t * F[j + 2] + t2 * F[j + 3] + t3 * F[j + 4] + t4 * F[j + 5]);
    v += c * tn;
  }
  if (zn != 2) v /= rad;
  return v;
};


function m_coord(t, n1, n2, n3) { //返回月球坐标,n1,n2,n3为各坐标所取的项数
  var re = new Array();
  re[0] = XL1_calc(0, t, n1);
  re[1] = XL1_calc(1, t, n2);
  re[2] = XL1_calc(2, t, n3);
  return re;
}

//=============================一些天文基本问题=====================================
//==================================================================================
function suoN(jd) { return Math.floor((jd + 8) / 29.5306); } //返回朔日的编号,jd应在朔日附近，允许误差数天
function gxc_sunLon(t) { //太阳光行差,t是世纪数
  var v = -0.043126 + 628.301955 * t - 0.000002732 * t * t; //平近点角
  var e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  return (-20.49552 * (1 + e * Math.cos(v))) / rad; //黄经光行差
}
function gxc_sunLat(t) { return 0; } //黄纬光行差
function gxc_moonLon(t) { return -3.4E-6; } //月球经度光行差,误差0.07"
function gxc_moonLat(t) { return 0.063 * Math.sin(0.057 + 8433.4662 * t + 0.000064 * t * t) / rad; } //月球纬度光行差,误差0.006"

function pGST(T, dt) { //传入T是2000年首起算的日数(UT),dt是deltatT(日),精度要求不高时dt可取值为0
  //返回格林尼治平恒星时(不含赤经章动及非多项式部分),即格林尼治子午圈的平春风点起算的赤经
  var t = (T + dt) / 36525, t2 = t * t, t3 = t2 * t, t4 = t3 * t;
  return pi2 * (0.7790572732640 + 1.00273781191135448 * T) //T是UT,下一行的t是力学时(世纪数)
    + (0.014506 + 4612.15739966 * t + 1.39667721 * t2 - 0.00009344 * t3 + 0.00001882 * t4) / rad;
}
function pGST2(jd) { //传入力学时J2000起算日数，返回平恒星时
  var dt = dt_T(jd);
  return pGST(jd - dt, dt);
}

function sunShengJ(jd, L, fa, sj) { //太阳升降计算。jd儒略日(须接近L当地平午UT)，L地理经度，fa地理纬度，sj=-1升,sj=1降
  var i;
  jd = floor(jd + 0.5) - L / pi2;
  for (i = 0; i < 2; i++) {
    var T = jd / 36525, E = (84381.4060 - 46.836769 * T) / rad; //黄赤交角
    var t = T + (32 * (T + 1.8) * (T + 1.8) - 20) / 86400 / 36525;  //儒略世纪年数,力学时
    var J = (48950621.66 + 6283319653.318 * t + 53 * t * t - 994
      + 334166 * cos(4.669257 + 628.307585 * t)
      + 3489 * cos(4.6261 + 1256.61517 * t)
      + 2060.6 * cos(2.67823 + 628.307585 * t) * t) / 10000000;
    var sinJ = sin(J), cosJ = cos(J); //太阳黄经以及它的正余弦值
    var gst = (0.7790572732640 + 1.00273781191135448 * jd) * pi2 + (0.014506 + 4612.15739966 * T + 1.39667721 * T * T) / rad; //恒星时(子午圈位置)
    var A = atan2(sinJ * cos(E), cosJ);  //太阳赤经
    var D = asin(sin(E) * sinJ);        //太阳赤纬
    var cosH0 = (sin(-50 * 60 / rad) - sin(fa) * sin(D)) / (cos(fa) * cos(D)); if (abs(cosH0) >= 1) return 0; //太阳在地平线上的cos(时角)计算
    jd += rad2rrad(sj * acos(cosH0) - (gst + L - A)) / 6.28; //(升降时角-太阳时角)/太阳速度
  }
  return jd; //反回格林尼治UT
}


function pty_zty(t) { //时差计算(高精度),t力学时儒略世纪数
  var t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t;
  var L = (1753470142 + 628331965331.8 * t + 5296.74 * t2 + 0.432 * t3 - 0.1124 * t4 - 0.00009 * t5) / 1000000000 + Math.PI - 20.5 / rad;

  var E, dE, dL, f, z = new Array();
  dL = -17.2 * Math.sin(2.1824 - 33.75705 * t) / rad; //黄经章
  dE = 9.2 * Math.cos(2.1824 - 33.75705 * t) / rad; //交角章
  E = hcjj(t) + dE; //真黄赤交角

  //地球坐标
  z[0] = XL0_calc(0, 0, t, 50) + Math.PI + gxc_sunLon(t) + dL;
  z[1] = -(2796 * Math.cos(3.1987 + 8433.46616 * t) + 1016 * Math.cos(5.4225 + 550.75532 * t) + 804 * Math.cos(3.88 + 522.3694 * t)) / 1000000000;

  z = llrConv(z, E); //z太阳地心赤道坐标
  z[0] -= dL * Math.cos(E);

  L = rad2rrad(L - z[0]);
  return L / pi2; //单位是周(天)
}
function pty_zty2(t) { //时差计算(低精度),误差约在1秒以内,t力学时儒略世纪数
  var L = (1753470142 + 628331965331.8 * t + 5296.74 * t * t) / 1000000000 + Math.PI;
  var z = new Array();
  var E = (84381.4088 - 46.836051 * t) / rad;
  z[0] = XL0_calc(0, 0, t, 5) + Math.PI, z[1] = 0; //地球坐标
  z = llrConv(z, E); //z太阳地心赤道坐标
  L = rad2rrad(L - z[0]);
  return L / pi2; //单位是周(天)
}



//物件XL : 日月黄道平分点坐标、视坐标、速度、已知经度反求时间等方面的计算
var XL = { //日月星历基本函数类
  //=====================
  //星历函数(日月球面坐标计算)

  E_Lon: function (t, n) { return XL0_calc(0, 0, t, n); }, //地球经度计算,返回Date分点黄经,传入世纪数、取项数
  M_Lon: function (t, n) { return XL1_calc(0, t, n); },    //月球经度计算,返回Date分点黄经,传入世纪数,n是项数比例
  //=========================
  E_v: function (t) { //地球速度,t是世纪数,误差小于万分3
    var f = 628.307585 * t;
    return 628.332 + 21 * Math.sin(1.527 + f) + 0.44 * Math.sin(1.48 + f * 2)
      + 0.129 * Math.sin(5.82 + f) * t + 0.00055 * Math.sin(4.21 + f) * t * t;
  },
  M_v: function (t) { //月球速度计算,传入世经数
    var v = 8399.71 - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t); //误差小于5%
    v -= 179 * Math.sin(2.543 + 15542.7543 * t)  //误差小于0.3%
      + 160 * Math.sin(0.1874 + 7214.0629 * t)
      + 62 * Math.sin(3.14 + 16657.3828 * t)
      + 34 * Math.sin(4.827 + 16866.9323 * t)
      + 22 * Math.sin(4.9 + 23871.4457 * t)
      + 12 * Math.sin(2.59 + 14914.4523 * t)
      + 7 * Math.sin(0.23 + 6585.7609 * t)
      + 5 * Math.sin(0.9 + 25195.624 * t)
      + 5 * Math.sin(2.32 - 7700.3895 * t)
      + 5 * Math.sin(3.88 + 8956.9934 * t)
      + 5 * Math.sin(0.49 + 7771.3771 * t);
    return v;
  },

  //=========================
  MS_aLon: function (t, Mn, Sn) { //月日视黄经的差值
    return this.M_Lon(t, Mn) + gxc_moonLon(t) - (this.E_Lon(t, Sn) + gxc_sunLon(t) + Math.PI);
  },
  S_aLon: function (t, n) {  //太阳视黄经
    return this.E_Lon(t, n) + nutationLon2(t) + gxc_sunLon(t) + Math.PI; //注意，这里的章动计算很耗时
  },

  //=========================

  E_Lon_t: function (W) { //已知地球真黄经求时间
    var t, v = 628.3319653318;
    t = (W - 1.75347) / v; v = this.E_v(t);   //v的精度0.03%，详见原文
    t += (W - this.E_Lon(t, 10)) / v; v = this.E_v(t);   //再算一次v有助于提高精度,不算也可以
    t += (W - this.E_Lon(t, -1)) / v;
    return t;
  },
  M_Lon_t: function (W) { //已知真月球黄经求时间
    var t, v = 8399.70911033384;
    t = (W - 3.81034) / v;
    t += (W - this.M_Lon(t, 3)) / v; v = this.M_v(t);  //v的精度0.5%，详见原文
    t += (W - this.M_Lon(t, 20)) / v;
    t += (W - this.M_Lon(t, -1)) / v;
    return t;
  },
  MS_aLon_t: function (W) { //已知月日视黄经差求时间
    var t, v = 7771.37714500204;
    t = (W + 1.08472) / v;
    t += (W - this.MS_aLon(t, 3, 3)) / v; v = this.M_v(t) - this.E_v(t);  //v的精度0.5%，详见原文
    t += (W - this.MS_aLon(t, 20, 10)) / v;
    t += (W - this.MS_aLon(t, -1, 60)) / v;
    return t;
  },
  S_aLon_t: function (W) { //已知太阳视黄经反求时间
    var t, v = 628.3319653318;
    t = (W - 1.75347 - Math.PI) / v; v = this.E_v(t); //v的精度0.03%，详见原文
    t += (W - this.S_aLon(t, 10)) / v; v = this.E_v(t); //再算一次v有助于提高精度,不算也可以
    t += (W - this.S_aLon(t, -1)) / v;
    return t;
  },
  /****
  MS_aLon_t1:function(W){ //已知月日视黄经差求时间,高速低精度,误差不超过40秒
    var t,v = 7771.37714500204;
    t  = ( W + 1.08472               )/v;
    t += ( W - this.MS_aLon(t, 3, 3) )/v;  v=this.M_v(t)-this.E_v(t);  //v的精度0.5%，详见原文
    t += ( W - this.MS_aLon(t,50,20) )/v;
    return t;
  },
  S_aLon_t1:function(W){ //已知太阳视黄经反求时间,高速低精度,最大误差不超过50秒,平均误差15秒
    var t,v= 628.3319653318;
    t  = ( W - 1.75347-Math.PI   )/v; v = 628.332 + 21*Math.sin( 1.527+628.307585*t );
    t += ( W - this.S_aLon(t,3) )/v;
    t += ( W - this.S_aLon(t,40))/v;
    return t;
  },
  ****/
  MS_aLon_t2: function (W) { //已知月日视黄经差求时间,高速低精度,误差不超过600秒(只验算了几千年)
    var t, v = 7771.37714500204;
    t = (W + 1.08472) / v;
    var L, t2 = t * t;
    t -= (-0.00003309 * t2 + 0.10976 * Math.cos(0.784758 + 8328.6914246 * t + 0.000152292 * t2) + 0.02224 * Math.cos(0.18740 + 7214.0628654 * t - 0.00021848 * t2) - 0.03342 * Math.cos(4.669257 + 628.307585 * t)) / v;
    L = this.M_Lon(t, 20) - (4.8950632 + 628.3319653318 * t + 0.000005297 * t * t + 0.0334166 * Math.cos(4.669257 + 628.307585 * t) + 0.0002061 * Math.cos(2.67823 + 628.307585 * t) * t + 0.000349 * Math.cos(4.6261 + 1256.61517 * t) - 20.5 / rad);
    v = 7771.38 - 914 * Math.sin(0.7848 + 8328.691425 * t + 0.0001523 * t * t) - 179 * Math.sin(2.543 + 15542.7543 * t) - 160 * Math.sin(0.1874 + 7214.0629 * t);
    t += (W - L) / v;
    return t;
  },
  S_aLon_t2: function (W) { //已知太阳视黄经反求时间,高速低精度,最大误差不超过600秒
    var t, L, v = 628.3319653318;
    t = (W - 1.75347 - Math.PI) / v;
    t -= (0.000005297 * t * t + 0.0334166 * Math.cos(4.669257 + 628.307585 * t) + 0.0002061 * Math.cos(2.67823 + 628.307585 * t) * t) / v;
    t += (W - this.E_Lon(t, 8) - Math.PI + (20.5 + 17.2 * Math.sin(2.1824 - 33.75705 * t)) / rad) / v;
    return t;
  },
  moonIll: function (t) { //月亮被照亮部分的比例
    var t2 = t * t, t3 = t2 * t, t4 = t3 * t;
    var D, M, m, a, dm = Math.PI / 180;
    D = (297.8502042 + 445267.1115168 * t - 0.0016300 * t2 + t3 / 545868 - t4 / 113065000) * dm; //日月平距角
    M = (357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000) * dm; //太阳平近点
    m = (134.9634114 + 477198.8676313 * t + 0.0089970 * t2 + t3 / 69699 - t4 / 14712000) * dm; //月亮平近点
    a = Math.PI - D + (-6.289 * Math.sin(m) + 2.100 * Math.sin(M) - 1.274 * Math.sin(D * 2 - m) - 0.658 * Math.sin(D * 2) - 0.214 * Math.sin(m * 2) - 0.110 * Math.sin(D)) * dm;
    return (1 + Math.cos(a)) / 2;
  },
  moonRad: function (r, h) { //转入地平纬度及地月质心距离,返回站心视半径(角秒)
    return cs_sMoon / r * (1 + Math.sin(h) * cs_rEar / r);
  },

  moonMinR: function (t, min) { //求月亮近点时间和距离,t为儒略世纪数力学时
    var a = 27.55454988 / 36525, b;
    if (min) b = -10.3302 / 36525; else b = 3.4471 / 36525;
    t = b + a * int2((t - b) / a + 0.5); //平近(远)点时间
    var r1, r2, r3, dt;
    //初算二次
    dt = 2 / 36525;
    r1 = XL1_calc(2, t - dt, 10);
    r2 = XL1_calc(2, t, 10);
    r3 = XL1_calc(2, t + dt, 10);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2;
    dt = 0.5 / 36525;
    r1 = XL1_calc(2, t - dt, 20);
    r2 = XL1_calc(2, t, 20);
    r3 = XL1_calc(2, t + dt, 20);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2;
    //精算
    dt = 1200 / 86400 / 36525;
    r1 = XL1_calc(2, t - dt, -1);
    r2 = XL1_calc(2, t, -1);
    r3 = XL1_calc(2, t + dt, -1);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2;
    r2 += (r1 - r3) / (r1 + r3 - 2 * r2) * (r3 - r1) / 8;
    var re = new Array(t, r2);
    return re;
  },
  moonNode: function (t, asc) {//月亮升交点
    var a = 27.21222082 / 36525, b;
    if (asc) b = 21 / 36525; else b = 35 / 36525;
    t = b + a * int2((t - b) / a + 0.5); //平升(降)交点时间
    var w, v, w2, dt;
    dt = 0.5 / 36525; w = XL1_calc(1, t, 10); w2 = XL1_calc(1, t + dt, 10); v = (w2 - w) / dt; t -= w / v;
    dt = 0.05 / 36525; w = XL1_calc(1, t, 40); w2 = XL1_calc(1, t + dt, 40); v = (w2 - w) / dt; t -= w / v;
    w = XL1_calc(1, t, -1); t -= w / v;
    var re = new Array(t, XL1_calc(0, t, -1));
    return re;
  },
  earthMinR: function (t, min) { //地球近远点
    var a = 365.25963586 / 36525, b;
    if (min) b = 1.7 / 36525; else b = 184.5 / 36525;
    t = b + a * int2((t - b) / a + 0.5); //平近(远)点时间
    var r1, r2, r3, dt;
    //初算二次
    dt = 3 / 36525;
    r1 = XL0_calc(0, 2, t - dt, 10);
    r2 = XL0_calc(0, 2, t, 10);
    r3 = XL0_calc(0, 2, t + dt, 10);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2; //误差几个小时
    dt = 0.2 / 36525;
    r1 = XL0_calc(0, 2, t - dt, 80);
    r2 = XL0_calc(0, 2, t, 80);
    r3 = XL0_calc(0, 2, t + dt, 80);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2; //误差几分钟
    //精算
    dt = 0.01 / 36525;
    r1 = XL0_calc(0, 2, t - dt, -1);
    r2 = XL0_calc(0, 2, t, -1);
    r3 = XL0_calc(0, 2, t + dt, -1);
    t += (r1 - r3) / (r1 + r3 - 2 * r2) * dt / 2; //误差小于秒
    r2 += (r1 - r3) / (r1 + r3 - 2 * r2) * (r3 - r1) / 8;
    var re = new Array(t, r2);
    return re;
  }
};
///////////////////////////////////////////////////
// 获取日程的函数
const scheduleMap = new Map([
  ["2024.11.07", "今天"],
  ["2024.11.15", "材料提交"],
  ["2024.12.21", "考研笔试"],
  // 添加更多日程...
]);
// 获取日程的函数
function getSchedule(jy, jm, jd) {
  // 格式化输入日期为 "YYYY.MM.DD"
  const dateKey = `${jy}.${String(jm).padStart(2, '0')}.${String(jd).padStart(2, '0')}`;
  
  // 使用Map快速查找日程
  return scheduleMap.get(dateKey) || "";
}
