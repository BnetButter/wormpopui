
document.addEventListener('DOMContentLoaded', function() {
    var viewModel = new JobViewModel();
    ko.applyBindings(viewModel);
    viewModel.fetchJobs();
});

function JobViewModel() {
    var self = this;
    self.jobs = ko.observableArray([]);
    console.log("HELLO")
    
        fetch('/api/job-status')
            .then(response => response.json())
            .then(data => {
                console.log(data)
                self.jobs(data.result); // Knockout.js observableArray update
            })
            .catch(error => console.error('Error fetching jobs:', error));

    self.stopJob = function(job) {
        // TODO: Implement stop functionality
        console.log("Stopping job", job.guid);
    };

    self.deleteJob = function(job) {
        // TODO: Implement delete functionality
        console.log("Deleting job", job.guid);
    };

    self.viewGraph = function(job) {
        window.location.href = `/digraph/index.html?guid=${job.guid}`;
    };

    self.downloadJob = function(job) {
        // TODO: Implement download functionality
        console.log("Downloading job", job.guid);
    };
}

// Activates knockout.js
ko.applyBindings(new JobViewModel());
