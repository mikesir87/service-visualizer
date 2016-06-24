var express = require('express'),
    Docker  = require('dockerode');

var app = express();
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var nodes = [];
refreshNodes();

app.get('/', function(req, res) {
  res.sendFile('index.html', { root: __dirname });
});




app.get('/containers', function(req, res) {

  docker.listTasks(function(err, tasks) {
    var data = { nodes : [] };

    tasks.forEach(function(task) {
      if (task.Status.State != 'running') return;

      var node = data.nodes.find(function(n) { return n.id == task.NodeID; });
      if (node == null) {
        node = { id : task.NodeID, containers: [] };
        if (nodes[ node.id ] === undefined) return refreshNodes();
        node.name = nodes[ node.id ];
        data.nodes.push(node);
      }
       
      node.containers.push(task.Spec.ContainerSpec.Image); 
    });

    res.set('Content-Type', 'application/json');
    res.send(data);
  });
});


app.listen(3000, function() {
  console.log('Listening on port 3000');
});


function refreshNodes() {
  docker.listNodes(function(err, nodeData) {
    nodes = {};
    nodeData.forEach(function(node) {
      nodes[ node.ID ] = node.Description.Hostname;
    });
  });
}
