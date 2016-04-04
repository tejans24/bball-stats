'use strict';

var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var DefaultRoute = window.ReactRouter.DefaultRoute;
var IndexRoute = window.ReactRouter.IndexRoute;
var Link = window.ReactRouter.Link;

var Navigation = React.createClass({
  render: function() {
    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link className="navbar-brand" to="/">Basketball Stats</Link>
          </div>
          <div id="navbar" className="navbar-collapse collapse">
            <ul className="nav navbar-nav">
              <li className="active">
                <Link to="/scores">Scores</Link>
              </li>
              <li>
                <Link to="/standings">Standings</Link>
              </li>
              <li><a href="#">Contact</a></li>
              <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Dropdown <span className="caret"></span></a>
                <ul className="dropdown-menu">
                  <li><a href="#">Action</a></li>
                  <li><a href="#">Another action</a></li>
                  <li><a href="#">Something else here</a></li>
                  <li role="separator" className="divider"></li>
                  <li className="dropdown-header">Nav header</li>
                  <li><a href="#">Separated link</a></li>
                  <li><a href="#">One more separated link</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
});

var Standing = React.createClass({
  render: function() {
    var standing = this.props.standing;

    return (
      <tr>
        <td>{standing.nickname}</td>
        <td>{standing.team_stats.wins}</td>
        <td>{standing.team_stats.losses}</td>
        <td>{standing.team_stats.pct}</td>
        <td>{standing.team_stats.gb_conf}</td>
        <td>{standing.team_stats.conf_win_loss}</td>
        <td>{standing.team_stats.div_win_loss}</td>
        <td>{standing.team_stats.home}</td>
        <td>{standing.team_stats.road}</td>
        <td>{standing.team_stats.l10}</td>
        <td>{standing.team_stats.streak}</td>
      </tr>
    );
  }
});

var ConferenceStandings = React.createClass({
  render: function() {
    if(!this.props.standings) { return false }

    var standings = this.props.standings.team.map(function(standing){
      return <Standing standing={standing}/>
    });
    var className = `section--${this.props.conference}-standings`
    return (
      <div className={className}>
        <table className="table ">
          <thead>
            <tr>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
              <th>Percentage</th>
              <th>GB</th>
              <th>CONF</th>
              <th>DIV</th>
              <th>Home</th>
              <th>Road</th>
              <th>Last 10</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {standings}
          </tbody>
        </table>
      </div>
    );
  }
});

var Standings = React.createClass({

  getStandingsFromServer: function() {
    var todayDate = new Date();
    var todayDateStr = (todayDate.getMonth() + 1) + '-' + todayDate.getDate() + '-'
      + todayDate.getFullYear();

    var standingsSource="http://data.nba.com/data/15m/json/cms/" + todayDate.getFullYear() + "/standings/conference.json";

    $.ajax({
      url: standingsSource,
      cache: false,
      crossDomain: true,
      success: function(data) {
        this.setState({
          standings: data.sports_content.standings
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
     });
  },
  componentDidMount: function() {
    this.getStandingsFromServer();
  },
  getInitialState: function() {
    return {standings: {conferences: {}}};
  },
  render: function() {
    return (
      <div className="section--standings">
        <ul className="nav nav-tabs" role="tablist">
          <li role="presentation" className="active">
            <a href="#east" aria-controls="east" role="tab" data-toggle="tab">East</a>
          </li>
          <li role="presentation">
            <a href="#west" aria-controls="west" role="tab" data-toggle="tab">West</a>
          </li>
        </ul>
        <div className="tab-content">
          <div role="tabpanel" className="tab-pane active" id="east">
            <ConferenceStandings standings={this.state.standings.conferences.East} conference="eastern" />
          </div>
          <div role="tabpanel" className="tab-pane" id="west">
            <ConferenceStandings standings={this.state.standings.conferences.West} conference="western" />
          </div>
        </div>
      </div>
    );
  }
});

var UnstartedGame = React.createClass({
  render: function() {
    console.log("unstarted game");

    var home = this.props.game.home;
    var visitor = this.props.game.visitor;

    function convertMilitaryTime(militaryTime) {
      var hours24 = parseInt(militaryTime.substring(0, 2),10);
      var hours = ((hours24 + 11) % 12) + 1;
      var amPm = hours24 > 11 ? ' pm' : ' am';
      var minutes = militaryTime.substring(2);

      return hours + ':' + minutes + amPm;
    }

    var broadcasters = this.props.game.broadcasters.tv.broadcaster[0].display_name;


    var convertedTime = convertMilitaryTime(this.props.game.time);
    //var boradcasters = "";

    return(
      <div className="section--unstarted-game">
        <strong>{this.props.game.home.nickname} vs {this.props.game.visitor.nickname}</strong><br></br>
        <strong>On</strong> {broadcasters}<br></br>
        <strong>At </strong> {convertedTime}
      </div>
    );
  }
});

var StartedGame = React.createClass({
  render: function() {
    console.log("started game");
    var home = this.props.game.home;
    var visitor = this.props.game.visitor;

    function getScoreHeader(game) {
      var periods = game.visitor.linescores.period;


      var periodTime = game.period_time;
      var scoreHeaderTDs = [];

      if(Array.isArray(periods)) {
        scoreHeaderTDs = periods.map(function(period){
          var td;

          if(period.period_value > 4) {
            td = <th>{period.period_name}</th>;
          } else {
            td = <th>{period.period_value}</th>;
          }
          return td
        });

        //if the period array doesn't have atleast 4 quarters
        //while the game is being played.
        if(scoreHeaderTDs.length < 4) {
          while(scoreHeaderTDs.length < 4) {
            scoreHeaderTDs.push(<th>{scoreHeaderTDs.length + 1}</th>);
          }
        }

        //adding empty td for the team in the table to the front
        scoreHeaderTDs.unshift(<th></th>);
        scoreHeaderTDs.push(<th>Total</th>);

      //if it's just the 1st quarter, NBA passed in element is not an array
      //so, just add the 1st element
      } else {
        scoreHeaderTDs.push(<th>1</th>);
        while(scoreHeaderTDs.length < 4) {
          scoreHeaderTDs.push(<th>{scoreHeaderTDs.length + 1}</th>);
        }

        scoreHeaderTDs.unshift(<th></th>);
        scoreHeaderTDs.push(<th>Total</th>);
      }

      return scoreHeaderTDs;
    }

    function getScoreTableData(teamScores) {
      var periods = teamScores.linescores.period;

      var scoreTDs = [];
      if(Array.isArray(periods)) {
        scoreTDs = periods.map(function(period){
          return <td>{period.score}</td>
        });
        while(scoreTDs.length < 4) {
          scoreTDs.push(<td>0</td>);
        }
        //adding empty td for the team in the table to the front
        scoreTDs.unshift(<td>{teamScores.nickname}</td>);
        scoreTDs.push(<td>{teamScores.score}</td>);
      } else {
        scoreTDs.push(<td>{periods.score}</td>);
        while(scoreTDs.length < 4) {
          scoreTDs.push(<td>0</td>);
        }
        scoreTDs.unshift(<td>{teamScores.nickname}</td>);
        scoreTDs.push(<td>{teamScores.score}</td>);
      }
      return scoreTDs;
    }

    var homeScoreTableData = getScoreTableData(home);
    var vistorScoreTableData = getScoreTableData(visitor);
    var scoreHeaderTDs = getScoreHeader(this.props.game);

    return (
      <div>
      <table  className="table table-condensed">
        <thead>
          <tr>
            {scoreHeaderTDs}
          </tr>
        </thead>
        <tbody>
          <tr>
            {homeScoreTableData}
          </tr>
          <tr>
            {vistorScoreTableData}
          </tr>
          <tr>
            <td>{this.props.game.period_time.period_status}</td>
            <td>{this.props.game.period_time.game_clock}</td>
          </tr>
        </tbody>
      </table>

      </div>
    );
  }
});

var Game = React.createClass({
  render: function() {
    var homeInfo = this.props.game.home;
    var visitorInfo = this.props.game.visitor;

    var gameData;

    //game hasn't started yet
    if(!this.props.game.home.linescores) {
      gameData = <UnstartedGame game={this.props.game}/>
    //game started and scoreboard is updated
    } else {
      gameData = <StartedGame game={this.props.game}/>
    }

    return (
      <div className="section--game col-xs-6 col-md-6">
        {gameData}
      </div>
    );
  }
})

var Scores = React.createClass({

  previousDay: function() {
    var currentDate = this.state.currentDate;
    currentDate.setDate(currentDate.getDate() - 1);
    this.setState({currentDate: currentDate})
    this.getScoresFromServer();
  },
  nextDay: function() {
    var currentDate = this.state.currentDate;
    currentDate.setDate(currentDate.getDate() + 1);
    this.setState({currentDate: currentDate})
    this.getScoresFromServer();
  },
  getInitialState: function() {
    function getProperDate(todayDate) {
      var correctedDate;
      var timeZoneDiffInHoursToEst = -(todayDate.getTimezoneOffset() / 60) + 5;
      console.log(timeZoneDiffInHoursToEst);

      switch (timeZoneDiffInHoursToEst) {
        case "":
          break;
        default:
          if(todayDate.getHours() < 12) {
            todayDate.setDate(todayDate.getDate() - 1);
            correctedDate = todayDate;
          }
          else {
            correctedDate = todayDate;
          }
      }
      return correctedDate;
    }
    var todayDate = getProperDate(new Date());
    console.log(todayDate);
    return {games: [], seasonMeta: {}, currentDate: todayDate};
  },
  getScoresFromServer: function() {
    var todayDate = this.state.currentDate;
    console.log(todayDate);

    var todayDateStr = (todayDate.getFullYear().toString() + ("0" + (todayDate.getMonth() + 1)).slice(-2) + ("0" + todayDate.getDate()).slice(-2) );
    console.log(todayDateStr);
    var scoresSource = "http://data.nba.com/5s/json/cms/noseason/scoreboard/" + todayDateStr + "/games.json";

    $.ajax({
      url: scoresSource,
      cache: false,
      crossDomain: true,
      success: function(data) {
        this.setState({
          games: data.sports_content.games.game,
          seasonMeta: data.sports_content.sports_meta.season_meta
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(scoresSource, status, err.toString());
      }.bind(this)
     });
  },
  componentDidMount: function() {
    this.getScoresFromServer();
    setInterval(this.getScoresFromServer, 2000);
  },
  render: function() {
    console.log(this.state);
    var games = this.state.games.map(function(game){
      return <Game game={game}/>
    });

    //formatting the meta game date
    var date = moment(this.state.currentDate);
    var str = date.format('MMMM DD YYYY');

    var title = str;
    return (
      <div className="container-fluid">
        <div className="section--date-navigation col-md-3">
          <button onClick={this.previousDay}>Previous</button><h4>{title}</h4><button onClick={this.nextDay}>Next</button>
        </div>
        <div className="section--scores row">
          {games}
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  render: function() {
    return (
      <div className="section--app container">
        <Navigation />
        {this.props.children}
      </div>
    );
  }
});

ReactDOM.render((
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Scores}/>
      <Route path="scores" component={Scores}/>
      <Route path="standings" component={Standings} />
    </Route>
  </Router>
  ), document.getElementById('main')
);
