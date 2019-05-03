import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // 现代DApp浏览器
  web3 = new Web3(window.ethereum);
  
  // 请求账户访问权限
  window.ethereum.request({ method: 'eth_requestAccounts' }).catch(console.error);
} else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // 传统MetaMask
  web3 = new Web3(window.web3.currentProvider);
} else {
  // 没有MetaMask，使用Infura作为备选
  console.warn('没有检测到Web3提供者，请安装MetaMask');
  web3 = new Web3('https://mainnet.infura.io');
}

export default web3;
