// https://docs.metamask.io/wallet/get-started/set-up-dev-environment/
// const Web3 = require('web3')

App = {
    loading: false,
    contracts: {

    },

    load: async () => {
        // Load app
        // connect to blockchain
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    // talks to ethereum blockchain
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        } else {
        window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
        } catch (error) {
            // User denied account access...
        }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // account we're connected with metamask
        web3.eth.defaultAccount = web3.eth.accounts[0]
        App.account = web3.eth.accounts[0]
        console.log(App.account)
    },

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json')

        // truffle contract: JS representation of smart contract
        App.contracts.TodoList = TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        // values from blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async () => {
        // prevent double render
        if (App.loading) {
            return
        }

        // update loading state
        App.setLoading(true)

        // render account
        $('#account').html(App.account)

        // render tasks
        await App.renderTasks()

        // update loading state
        App.setLoading(false)
    },

    renderTasks: async () => {
        // load task count from blockchain
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')

        // render each task with new template
        for (var i = 1; i <= taskCount; i++) {
            // fetch task data from the blockchain
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            // create html for task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input').prop('name', taskId).prop('checked', taskCompleted).on('click', App.toggleCompleted)

            // put task in correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            // show task 
            $newTaskTemplate.show()
        }
    },

    createTask: async () => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})

window.addEventListener("load", async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
})