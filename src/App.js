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
      this.setState({ message: '加载数据失败，请刷新页面重试', loading: false });
    }
  }

  sendOrther = async (event) => {
    event.preventDefault();
    
    // 输入验证
    const value = parseFloat(this.state.value);
    if (isNaN(value) || value < 0.02) {
      this.setState({ message: '请输入有效金额，至少0.02 ETH' });
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        this.setState({ message: '请先连接MetaMask钱包' });
        return;
      }

      this.setState({ message: '等待事务提交完成...', loading: true });
      
      await bocai.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether')
      });
      
      this.setState({ message: '提交成功！', value: '', loading: false });
      // 刷新合约数据
      await this.loadContractData();
    } catch (error) {
      console.error('提交失败:', error);
      this.setState({ 
        message: '提交失败: ' + (error.message || '未知错误'), 
        loading: false 
      });
    }
  }

  openTheGame = async (event) => {
    event.preventDefault();
    
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts.length) {
        this.setState({ message: '请先连接MetaMask钱包' });
        return;
      }

      // 检查是否为管理员
      if (accounts[0].toLowerCase() !== this.state.manager.toLowerCase()) {
        this.setState({ message: '只有管理员可以开奖' });
        return;
      }

      this.setState({ message: '抽奖中...', loading: true });
      
      await bocai.methods.pickwinner().send({ from: accounts[0] });
      
      this.setState({ message: '开奖完成！', loading: false });
      // 刷新合约数据
      await this.loadContractData();
    } catch (error) {
      console.error('开奖失败:', error);
      this.setState({ 
        message: '开奖失败: ' + (error.message || '未知错误'), 
        loading: false 
      });
    }
  }


  render() {
    const { manager, players, balance, value, message, loading } = this.state;

    return (
      <div className="app-container">
        <header className="app-header">
          <h1>🎲游戏</h1>
        </header>

        <main className="app-main">
          <section className="game-info">
            <div className="info-card">
              <h3>游戏信息</h3>
              <div className="info-item">
                <span className="label">管理员地址:</span>
                <span className="value">{manager || '加载中...'}</span>
              </div>
              <div className="info-item">
                <span className="label">参与人次:</span>
                <span className="value">{players.length}</span>
              </div>
              <div className="info-item">
                <span className="label">奖池金额:</span>
                <span className="value">
                  {balance ? `${web3.utils.fromWei(balance, 'ether')} ETH` : '加载中...'}
                </span>
              </div>
            </div>
          </section>

          <section className="game-actions">
            <div className="action-card">
              <h3>🚀 参与游戏</h3>
              <p>最低参与金额: 0.02 ETH</p>
              <form onSubmit={this.sendOrther}>
                <div className="input-group">
                  <label htmlFor="amount">参与金额 (ETH):</label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.02"
                    placeholder="0.02"
                    value={value}
                    onChange={(event) => this.setState({ value: event.target.value })}
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !value}
                >
                  {loading ? '处理中...' : '参与游戏'}
                </button>
              </form>
            </div>

            <div className="action-card">
              <h3>🎯 开奖</h3>
              <p>只有管理员可以开奖</p>
              <button 
                onClick={this.openTheGame}
                className="btn btn-secondary"
                disabled={loading || players.length === 0}
              >
                {loading ? '开奖中...' : '开始开奖'}
              </button>
            </div>
          </section>

          {message && (
            <section className="message-section">
              <div className={`message ${message.includes('失败') ? 'error' : 'success'}`}>
                {message}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }
}

export default App;
