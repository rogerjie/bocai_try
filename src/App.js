import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import bocai from './bocai';

class App extends Component {
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    loading: false
  }
  async componentDidMount() {
    await this.loadContractData();
  }

  loadContractData = async () => {
    try {
      this.setState({ loading: true });
      const [manager, players, balance] = await Promise.all([
        bocai.methods.manager().call(),
        bocai.methods.getPlayers().call(),
        web3.eth.getBalance(bocai.options.address)
      ]);
      this.setState({ manager, players, balance, loading: false });
    } catch (error) {
      console.error('加载合约数据失败:', error);
      this.setState({ message: '加载数据失败，请刷新页面重试 ', loading: false });
    }
  }

sendOrther= async event =>{
  event.preventDefault();
  if(this.state.value<0.02)
  {
    alert("至少0.02eth哦！");
    return;
  }
  const accounts =await web3.eth.getAccounts();

  this.setState({message:'等待事务提交完成...'});
  await bocai.methods.enter().send({from:accounts[0],value:web3.utils.toWei(this.state.value,'ether')});
  this.setState({message:'提交成功...'});

}
openTheGame= async event =>{
  event.preventDefault();
  const accounts =await web3.eth.getAccounts();

  this.setState({message:'抽奖中...'});
  await bocai.methods.pickwinner().send({from:accounts[0]});
  this.setState({message:'赢家...'});

}


  render() {


    return (
      <div>
      <h1>菠菜项目</h1>
      <p>管理员的地址为：{this.state.manager}</p>
      <p>当前参与人次：{this.state.players.length}</p>
      <p>当前资金池：{web3.utils.fromWei(this.state.balance,'ether')} eth</p>
      <hr/>
      <form>
          <h5>搏一搏单车变摩托</h5>
          <div>
          <label>请输入您要参与的金额</label>
          <input
            value={this.state.value}
            onChange={event=>{this.setState({value:event.target.value})}}
          />
          </div>
          <button onClick={this.sendOrther}>提交</button>
      </form>
        <hr/>
        <p>{this.state.message}</p>

        <hr/>
        <h5>开始抽奖了</h5>
        <button onClick={this.openTheGame}>提交</button>
      </div>
    );
  }
}

export default App;
