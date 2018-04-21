var data = [{
				  type: 'bar',
				  x: [1000, 2000, 1500, 1700, 1800, 1900,1600, 1550],
				  y: ['<b>Event</b>', '<b>Sports</b>', '<b>Politics</b>', '<b>Entertain</b>', '<b>News</b>', '<b>Technology</b>', '<b>Business</b>', '<b>Health</b>'],
				  marker:{	
					color: ['E8CD5E','AAAAAA','FF6800','FF0000','3386FF','FFA5F9','36FF5D','56EAFF']
				  },
				  orientation: 'h'
				}];

				Plotly.newPlot('barChart', data);