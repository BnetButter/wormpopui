function SimulationInstance(guid, name) {
    const self = this;
    self.guid = guid
    self.name = name
    self.selected = ko.observable(false)
}

function SelectableHeader(name, observableX) {
    const self = this
    self.name = name
    self.observableX = observableX
    self.selected = ko.observable(false)
    self.selected.subscribe(() => {
        if (self.selected && self.name === self.observableX()) {
            self.selected(false)
        }
    })
}

function TableModel(data, headers) {
    const self = this
    self.headers = headers
    self.rows = []
    const numRows = data[self.headers[0].name].length
    
    for (let i = 0; i < numRows; i++) {
        const row = []
        
        for (let col of self.headers) {
            const column = data[col.name]
            row.push(column[i])
        }
        self.rows.push(row)
    }
    console.log(self.rows)
}

function DirectoryModel() {
    const self = this

    self.allSimulationInstance = ko.observableArray([])
    self.selectedSimulation = ko.observable(null)

    self.sqlQuery = ko.observable("HGELLO")
    self.sqlResults = ko.observable(null)

    self.tableView = ko.observable(false)

    self.tableModel = ko.observable()

    self.tableFields = ko.observableArray([])
    self.tableError = ko.observable("")

    /* Controls if we show table or the graph */
    self.showTable = ko.observable(true)
    
    self.tableLoaded = ko.computed(() => {
        const table = self.tableView()
        if (!table) return false 
        return table.headers.length > 0
    })

    self.showTable.subscribe((v) => {
        console.log(v)
    })

    self.toggleShowTable = () => {
        self.showTable(! self.showTable())
    }

    /* Pagination */
    self.rowsPerPage = ko.observable(50)
    self.pageNumber = ko.observable(1)

    /* Graphable Columns */
    self.selectedX = ko.observable("")

    /* Make sure selected X and Y can't be the same header  */
    self.selectedY = () => self.tableModel() 
        ? self.tableModel().headers
            .filter((x) => x.selected()) 
            .map((x) => x.name)
            .filter((x) => x !== self.selectedX())
        : []
    
        /* Make sure selected X and Y can't be the same header  */
    self.selectedX.subscribe((value) => {
        console.log(value)
        self.tableModel().headers.forEach((header) => {
            const name = header.name
            if (name === value) {
                header.selected(false)
            }
        })
    })

    // Load simulation instance
    fetch('/api/job-status')
        .then(response => response.json())
        .then(data => {
            const jobs = data.result
            self.allSimulationInstance(jobs.map(obj => new SimulationInstance(obj.guid, obj.name)))
        });
    
    self.userSelectedSimulation = (item) => {
        console.log(item)
        const isAlreadySelected = item.selected()
        self.allSimulationInstance().forEach((inst) => inst.selected(false))
        item.selected(!isAlreadySelected)

        if (item.selected()) {
            self.selectedSimulation(item)
        }
        else {
            self.selectedSimulation(null)
        }
    }

    self.pageLeft = () => {
        const pageNum = self.pageNumber()
        self.pageNumber(pageNum > 1 ? pageNum - 1 : pageNum)
    }

    self.pageRight = () => {
        const pageNum = self.pageNumber()
        self.pageNumber(pageNum + 1)
    }

    self.executeSql = () => {
        if (! self.selectedSimulation())
            return 

        const url = "/api/sql";
        const data = {
            query: self.sqlQuery(),
            guid: self.selectedSimulation().guid,
            pageNumber: self.pageNumber(),
            rowsPerPage: self.rowsPerPage()
        };

        // Make the fetch request
        fetch(url, {
            method: 'POST',   // Using POST method to send the data
            headers: {
                'Content-Type': 'application/json',  // Indicating that we're sending JSON data
            },
            body: JSON.stringify(data)  // Convert the JavaScript object to a JSON string
        })
        .then(response => {
            // Process the response here
            // This function is called when the server response is available
            // Check if the response is ok, then convert it to JSON
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            // Handle the data from the server
            // This function handles the JSON data returned from the server
            console.log(data)
            self.sqlResults(data.result)
            self.tableModel(new TableModel(data.result, data.header.map((name) => new SelectableHeader(name, self.selectedX))))
            self.tableFields(self.tableModel())
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('There was a problem with the fetch operation:', error);
            self.sqlResults(null)
        });
    }

    self.rowsPerPage.subscribe(self.executeSql)
    self.pageNumber.subscribe(self.executeSql)


    self.showTable.subscribe((showTable) => {
        const sqlResults = self.sqlResults()
        if (showTable)
            return

        console.log(self.selectedY(), )


        console.log(sqlResults)

        var layout = {
            title: 'Line and Scatter Plot',
            xaxis: {
                title: self.selectedX()
            },
            yaxis: {
                title: self.selectedY()[0]
            }
        };

        const Xaxis = sqlResults[self.selectedX()]

        const Yaxis = sqlResults[self.selectedY()[0]]


        var trace1 = {
            x: Xaxis,
            y: Yaxis,
            mode: 'lines+markers',
            type: 'scatter'
        };

        var data = self.selectedY().map((col) => {
            return {
                x: Xaxis,
                y: sqlResults[col],
                mode: 'lines+markers',
                type: 'scatter'
            }
        })

        Plotly.newPlot('myDiv', data, layout)

        
        
    })


}

// Apply bindings only after the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Now set up the subscription

    // Apply Knockout bindings
    ko.applyBindings(new DirectoryModel());
});
