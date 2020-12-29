App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    if(window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      }catch(error) {
        console.error("User has been denied access");
      }
    }
    else if(window.web3){
      App.web3Provider = window.web3.currentProvider
    }

    else
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');

      web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {

    $.getJSON('adoption.json', function(data) {

        var adoptArtifact = data;

        App.contracts.adoption = TruffleContract(adoptArtifact);

        App.contracts.adoption.setProvider(App.web3Provider);

        return App.markAdopted();

    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInst;

    App.contracts.adoption.deployed().then(function(instance) {
      adoptionInst = instance;

      return adoptionInst.getAdopters.call();
    }).then(function(adopters) {

      for(var i = 0; i < adopters.length; i++)
      {

        if(adopters[i] != '0x0000000000000000000000000000000000000000')
            {
              $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);   
            }

      }

    }).catch(function(err){

      console.log(err);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInst;

    web3.eth.getAccounts(function(error,accounts) {

      if(error)
        {
          console.log(error.message);
        }

    var account = accounts[0];

    App.contracts.adoption.deployed().then(function(instance) {

      adoptionInst = instance;

      return adoptionInst.adopt(petId, {from: account});

    }).then(function(result){

        return App.markAdopted();
    }).catch(function(err){

      console.log(err.message);

    });
    });
  
  },

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
