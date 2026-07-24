
/*==========================================================
  NORTHSTAR CUSTOMER SUCCESS
  APP.JS
  PART 1

  - Load customers.json
  - Helper functions
  - KPI calculations
  - Customer table
==========================================================*/

let customers = [];
let filteredCustomers = [];

/*==========================================================
  DOM ELEMENTS
==========================================================*/

const customersElement = document.getElementById("customers");

const mrrElement = document.getElementById("mrr");

const healthElement = document.getElementById("healthScore");

const riskElement = document.getElementById("riskAccounts");

const renewalsElement = document.getElementById("renewals");

const nrrElement = document.getElementById("nrr");

const ticketsElement = document.getElementById("tickets");

const usageElement = document.getElementById("usage");

const customerTable =
    document.getElementById("customerTable");

/*==========================================================
  FORMATTERS
==========================================================*/

const currency =
    new Intl.NumberFormat(
        "en-GB",
        {
            style:"currency",
            currency:"GBP",
            maximumFractionDigits:0
        }
    );

function formatCurrency(value){

    return currency.format(value);

}

function formatDate(date){

    return new Date(date).toLocaleDateString(

        "en-GB",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}

/*==========================================================
  BADGES
==========================================================*/

function healthBadge(score){

    if(score >= 80){

        return "badge badge-healthy";

    }

    if(score >= 60){

        return "badge badge-warning";

    }

    return "badge badge-risk";

}

function statusClass(status){

    switch(status){

        case "Healthy":

            return "status status-healthy";

        case "Needs Attention":

            return "status status-attention";

        default:

            return "status status-risk";

    }

}

/*==========================================================
  KPI CALCULATIONS
==========================================================*/

function calculateKPIs(data){

    const activeCustomers =
        data.length;

    const totalMRR =
        data.reduce(

            (sum,customer)=>

                sum + customer.mrr,

            0

        );

    const averageHealth =
        data.length

        ?

        data.reduce(

            (sum,customer)=>

                sum + customer.health,

            0

        ) / data.length

        :

        0;

    const atRisk =
        data.filter(

            customer=>

                customer.status === "At Risk"

        ).length;

    const renewals =
        data.filter(customer=>{

            const renewal =
                new Date(customer.renewalDate);

            const today =
                new Date();

            return (

                renewal.getMonth() === today.getMonth()

            );

        }).length;

    const totalTickets =
        data.reduce(

            (sum,customer)=>

                sum + customer.tickets,

            0

        );

    const averageUsage =
        data.length

        ?

        data.reduce(

            (sum,customer)=>

                sum + customer.usage,

            0

        ) / data.length

        :

        0;

    /* Fake NRR calculation for demo */

    const nrr =
        Math.round(

            98 +

            (averageHealth / 100) * 8

        );

    customersElement.textContent =
        activeCustomers;

    mrrElement.textContent =
        formatCurrency(totalMRR);

    healthElement.textContent =
        Math.round(averageHealth);

    riskElement.textContent =
        atRisk;

    renewalsElement.textContent =
        renewals;

    nrrElement.textContent =
        `${nrr}%`;

    ticketsElement.textContent =
        totalTickets;

    usageElement.textContent =
        `${Math.round(averageUsage)}%`;

}

/*==========================================================
  CUSTOMER TABLE
==========================================================*/

function renderTable(data){

    customerTable.innerHTML = "";

    if(!data.length){

        customerTable.innerHTML = `

        <tr>

            <td colspan="10">

                No customers found.

            </td>

        </tr>

        `;

        return;

    }

    data.forEach(customer=>{

        const row =
            document.createElement("tr");

        row.innerHTML = `

        <td>

            <div class="company">

                ${customer.company}

                <small>

                    ${customer.id}

                </small>

            </div>

        </td>

        <td>

            ${customer.csm}

        </td>

        <td>

            ${customer.industry}

        </td>

        <td>

            <span class="${healthBadge(customer.health)}">

                ${customer.health}

            </span>

        </td>

        <td class="currency">

            ${formatCurrency(customer.mrr)}

        </td>

        <td class="percentage">

            ${customer.usage}%

        </td>

        <td>

            ${customer.tickets}

        </td>

        <td>

            ${formatDate(customer.renewalDate)}

        </td>

        <td>

            ${customer.risk}

        </td>

        <td>

            <span class="${statusClass(customer.status)}">

                ${customer.status}

            </span>

        </td>

        `;

        customerTable.appendChild(row);

    });

}

/*==========================================================
  LOAD JSON
==========================================================*/

async function loadCustomers(){

    try{

        const response =
            await fetch(

                "data/customers.json"

            );

        customers =
            await response.json();

        filteredCustomers =

            [...customers];

        calculateKPIs(

            filteredCustomers

        );

        renderTable(

            filteredCustomers

        );

        console.log(

            `Loaded ${customers.length} customers`

        );

    }

    catch(error){

        console.error(error);

        customerTable.innerHTML = `

        <tr>

            <td colspan="10">

                Unable to load customers.json

            </td>

        </tr>

        `;

    }

}

/*==========================================================
  INITIALIZE
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    loadCustomers

);


/*==========================================================
  NORTHSTAR CUSTOMER SUCCESS
  APP.JS
  PART 2

  - Customer Health Trend
  - Customer Distribution
  - Chart Updates
==========================================================*/

let healthChart = null;

let distributionChart = null;

/*==========================================================
  COLOURS
==========================================================*/

const chartColours = {

    primary:"#2563eb",

    success:"#22c55e",

    warning:"#f59e0b",

    danger:"#ef4444",

    purple:"#8b5cf6",

    blue:"#60a5fa"

};

/*==========================================================
  HEALTH TREND
==========================================================*/

function renderHealthChart(data){

    const monthlyHealth = {};

    data.forEach(customer=>{

        const month =
            new Date(customer.renewalDate)
            .toLocaleString(
                "default",
                {
                    month:"short"
                }
            );

        if(!monthlyHealth[month]){

            monthlyHealth[month] = [];

        }

        monthlyHealth[month]
            .push(customer.health);

    });

    const labels =
        Object.keys(monthlyHealth);

    const values =
        labels.map(month=>{

            const scores =
                monthlyHealth[month];

            const average =

                scores.reduce(

                    (sum,value)=>

                        sum + value,

                    0

                ) / scores.length;

            return Math.round(average);

        });

    const ctx =
        document
        .getElementById("healthChart")
        .getContext("2d");

    if(healthChart){

        healthChart.destroy();

    }

    healthChart = new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[

                {

                    label:"Health Score",

                    data:values,

                    borderColor:
                        chartColours.primary,

                    backgroundColor:
                        "rgba(37,99,235,.10)",

                    fill:true,

                    tension:.4,

                    borderWidth:3,

                    pointRadius:5,

                    pointHoverRadius:7

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                }

            },

            scales:{

                y:{

                    min:0,

                    max:100

                }

            }

        }

    });

}

/*==========================================================
  CUSTOMER DISTRIBUTION
==========================================================*/

function renderDistributionChart(data){

    let healthy = 0;

    let attention = 0;

    let risk = 0;

    data.forEach(customer=>{

        switch(customer.status){

            case "Healthy":

                healthy++;

                break;

            case "Needs Attention":

                attention++;

                break;

            default:

                risk++;

        }

    });

    const ctx =

        document

        .getElementById(
            "distributionChart"
        )

        .getContext("2d");

    if(distributionChart){

        distributionChart.destroy();

    }

    distributionChart = new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:[

                "Healthy",

                "Needs Attention",

                "At Risk"

            ],

            datasets:[

                {

                    data:[

                        healthy,

                        attention,

                        risk

                    ],

                    backgroundColor:[

                        chartColours.success,

                        chartColours.warning,

                        chartColours.danger

                    ],

                    borderWidth:2,

                    borderColor:"#ffffff"

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            cutout:"68%",

            plugins:{

                legend:{

                    position:"bottom"

                }

            }

        }

    });

}

/*==========================================================
  UPDATE CHARTS
==========================================================*/

function updateCharts(data){

    renderHealthChart(data);

    renderDistributionChart(data);

}


/*==========================================================
  NORTHSTAR CUSTOMER SUCCESS
  APP.JS
  PART 3

  - Search
  - Filters
  - CSV Export
  - Dashboard Refresh
==========================================================*/

/*==========================================================
  FILTER ELEMENTS
==========================================================*/

const searchInput =
    document.getElementById("searchInput");

const csmFilter =
    document.getElementById("csmFilter");

const riskFilter =
    document.getElementById("riskFilter");

const industryFilter =
    document.getElementById("industryFilter");

/*==========================================================
  POPULATE FILTERS
==========================================================*/

function populateFilters(){

    const csms =
        [...new Set(

            customers.map(

                customer => customer.csm

            )

        )].sort();

    const industries =
        [...new Set(

            customers.map(

                customer => customer.industry

            )

        )].sort();

    csms.forEach(csm=>{

        csmFilter.innerHTML +=

        `<option value="${csm}">

            ${csm}

        </option>`;

    });

    industries.forEach(industry=>{

        industryFilter.innerHTML +=

        `<option value="${industry}">

            ${industry}

        </option>`;

    });

    [

        "Low",

        "Medium",

        "High"

    ].forEach(level=>{

        riskFilter.innerHTML +=

        `<option value="${level}">

            ${level}

        </option>`;

    });

}

/*==========================================================
  APPLY FILTERS
==========================================================*/

function applyFilters(){

    const search =
        searchInput.value
        .toLowerCase();

    const csm =
        csmFilter.value;

    const risk =
        riskFilter.value;

    const industry =
        industryFilter.value;

    filteredCustomers =

        customers.filter(customer=>{

            const matchesSearch =

                customer.company
                .toLowerCase()
                .includes(search);

            const matchesCSM =

                csm === "all"

                ||

                customer.csm === csm;

            const matchesRisk =

                risk === "all"

                ||

                customer.risk === risk;

            const matchesIndustry =

                industry === "all"

                ||

                customer.industry === industry;

            return (

                matchesSearch

                &&

                matchesCSM

                &&

                matchesRisk

                &&

                matchesIndustry

            );

        });

    refreshDashboard();

}

/*==========================================================
  DASHBOARD REFRESH
==========================================================*/

function refreshDashboard(){

    calculateKPIs(

        filteredCustomers

    );

    renderTable(

        filteredCustomers

    );

    updateCharts(

        filteredCustomers

    );

}

/*==========================================================
  EXPORT CSV
==========================================================*/

function exportCSV(){

    if(!filteredCustomers.length){

        return;

    }

    const headers =

        [

            "Company",

            "CSM",

            "Industry",

            "Health",

            "MRR",

            "Usage",

            "Tickets",

            "Renewal",

            "Risk",

            "Status"

        ];

    const rows =

        filteredCustomers.map(customer=>[

            customer.company,

            customer.csm,

            customer.industry,

            customer.health,

            customer.mrr,

            customer.usage,

            customer.tickets,

            customer.renewalDate,

            customer.risk,

            customer.status

        ]);

    const csv =

        [

            headers.join(","),

            ...rows.map(

                row=>row.join(",")

            )

        ].join("\n");

    const blob =

        new Blob(

            [csv],

            {

                type:"text/csv"

            }

        );

    const url =

        URL.createObjectURL(blob);

    const link =

        document.createElement("a");

    link.href = url;

    link.download =

        "customer-success-dashboard.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

/*==========================================================
  EVENTS
==========================================================*/

searchInput.addEventListener(

    "input",

    applyFilters

);

csmFilter.addEventListener(

    "change",

    applyFilters

);

riskFilter.addEventListener(

    "change",

    applyFilters

);

industryFilter.addEventListener(

    "change",

    applyFilters

);

/*==========================================================
  EXPORT BUTTON
==========================================================*/

const exportButton =

    document.querySelector(

        ".table-card button"

    );

if(exportButton){

    exportButton.addEventListener(

        "click",

        exportCSV

    );

}

/*==========================================================
  OVERRIDE LOAD FUNCTION
==========================================================*/

async function loadCustomers(){

    try{

        const response =

            await fetch(

                "data/customers.json"

            );

        customers =

            await response.json();

        filteredCustomers =

            [...customers];

        populateFilters();

        refreshDashboard();

        console.log(

            `Loaded ${customers.length} customers.`

        );

    }

    catch(error){

        console.error(error);

    }

}

/*==========================================================
  START APPLICATION
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    loadCustomers

);




