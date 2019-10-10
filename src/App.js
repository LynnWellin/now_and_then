import React, { Component } from 'react';
import './App.css';

const base =
	'https://us-central1-personalwebsite-189620.cloudfunctions.net/requestArticles';

class App extends Component {
	state = {
		lesserArticles: [],
		greaterArticles: [],
	};

	fetchArticles(y, year) {
		console.log('Testing request...');
		const articlesYear = '/year=' + year;

		const requestURL = base + articlesYear;
		let request = new XMLHttpRequest();
		console.log(requestURL);
		request.open('GET', requestURL);
		request.send();

		request.onload = () => {
			let articles = JSON.parse(request.response);
			console.log(articles);
			this.setState({
				[y.slice(0, -4) + 'Articles']: articles,
			});
		};
	}

	render() {
		return (
			<div className='container'>
				<div className='header'>
					<h1 className='pageTitle'>Then and Now</h1>
					<div className='yearSelectionContainer'>
						<YearBar
							type='lesser'
							lower={1981}
							upper={2018}
							fetchArticles={(y, year) =>
								this.fetchArticles(y, year)
							}
						/>
						<YearBar
							type='greater'
							lower={1982}
							upper={2019}
							fetchArticles={(y, year) =>
								this.fetchArticles(y, year)
							}
						/>
					</div>
				</div>
				<AvaliableArticles
					type='lesserYear'
					articles={this.state.lesserArticles}
				/>
				<AvaliableArticles
					type='greaterYear'
					articles={this.state.greaterArticles}
				/>
			</div>
		);
	}
}

class YearBar extends Component {
	state = {
		year: '',
		displayYear: '',
		lower: 'yearLimit lower ',
		upper: 'yearLimit upper ',
	};

	updateYear(e) {
		if (!isNaN(e.target.value) || e.target.value === '') {
			let num = parseInt(e.target.value) || '';
			if (num < this.props.lower) {
				this.setState({
					year: parseInt(e.target.value) || '',
					lower: 'yearLimit lower yearLimitViolated',
					upper: 'yearLimit upper ',
				});
			} else if (num > this.props.upper) {
				this.setState({
					year: parseInt(e.target.value) || '',
					upper: 'yearLimit upper yearLimitViolated',
					lower: 'yearLimit lower ',
				});
			} else {
				this.setState(
					{
						year: parseInt(e.target.value) || '',
						displayYear: parseInt(e.target.value),
						lower: 'yearLimit lower ',
						upper: 'yearLimit upper ',
					},
					() =>
						this.props.fetchArticles(
							this.props.type + 'Year',
							this.state.year
						)
				);
			}
		}
	}

	render() {
		return (
			<div className='yearSelect'>
				<h4 className='yearSelectHeader'>
					{this.props.type === 'lesser'
						? 'Select first year'
						: 'Select second year'}
				</h4>
				<div className='yearInputContainer'>
					<p className={this.state.lower}>
						{this.props.lower - 1}
						{' <'}
					</p>
					<input
						className='yearInput'
						value={this.state.year}
						onChange={e => this.updateYear(e)}
					/>
					<p className={this.state.upper}>
						{'> '}
						{this.props.upper + 1}
					</p>
				</div>
				<h4 className='yearSelectHeader'>{this.state.displayYear}</h4>
			</div>
		);
	}
}

class AvaliableArticles extends Component {
	state = { articleOpen: null };

	componentDidUpdate(previous) {
		if (previous.articles !== this.props.articles) {
			// Close article open for previous year
			this.openArticle(null);
		}
	}

	openArticle(id) {
		console.log(id ? 'Opening ' + id : 'Closing Article');
		this.setState({
			articleOpen: id,
		});
	}

	render() {
		return (
			<div className={this.props.type}>
				{this.state.articleOpen ? (
					<Article
						id={this.state.articleOpen}
						close={() => this.openArticle(null)}
					/>
				) : null}
				<div className='articleContainer'>
					{this.props.articles.map(article => {
						return (
							<ArticleCard
								key={article.id}
								articleName={article.webTitle}
								date={article.webPublicationDate}
								section={article.pillarName}
								subSection={article.sectionName}
								id={article.id}
								selected={() => this.openArticle(article.id)}
							/>
						);
					})}
				</div>
			</div>
		);
	}
}

class Article extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: 'Loading...',
			date: '',
			author: '',
			body: '',
		};
		this.fetchArticle();
	}

	fetchArticle() {
		console.log('Testing request...');

		const base =
			'https://us-central1-personalwebsite-189620.cloudfunctions.net/requestAnArticle';
		const articleId = '/id=' + this.props.id;

		console.log(articleId);
		const requestURL = base + articleId;
		let request = new XMLHttpRequest();
		console.log(requestURL);
		request.open('GET', requestURL);
		request.send();

		request.onload = () => {
			console.log(request);
			if (request.status === 200) {
				let data = JSON.parse(request.response);
				console.log(data);
				let res = data[0];
				let body = this.formatBody(
					res['blocks']['body']['0']['bodyHtml']
				);
				this.setState({
					title: res.webTitle,
					date: res.webPublicationDate.slice(0, 10),
					author: res['tags']['0']
						? res['tags']['0']['webTitle']
						: 'Author Unavaliable',
					body: body,
				});
			} else {
				this.setState({
					title: 'Error Fetching Article.',
				});
			}
		};
	}

	formatBody(body) {
		// Add linke breaks at paragraphs
		body = body.replace(/<p>/g, '\n\n');
		// Add linke breaks at any headers
		body = body.replace(/<\/h[1-6]>/g, '\n');
		body = body.replace(/<h[1-6]>/g, '\n');
		// Remove remainig html markers
		body = body.replace(/<.*?>/g, '');

		return body.trim();
	}

	render() {
		return (
			<div className='article'>
				<div className='articleHeader'>
					<div
						className='backButton'
						onClick={() => this.props.close()}
					>
						<p>Back</p>
					</div>
				</div>
				<h3 className='articleTitle'>{this.state.title}</h3>
				<div className='articleDetails'>
					<h4 className='articleDate'>{this.state.date}</h4>
					<h4 className='articleAuthor'>{this.state.author}</h4>
				</div>
				<p className='articleBody'>{this.state.body}</p>
			</div>
		);
	}
}

class ArticleCard extends Component {
	render() {
		return (
			<div className='card' onClick={() => this.props.selected()}>
				<h2 className='cardTitle'>{this.props.articleName}</h2>
				<h3 className='cardDate'>{this.props.date.slice(0, 10)}</h3>
				<h4 className='cardSection'>Section: {this.props.section}</h4>
				<h4 className='cardSection'>
					Sub-Section: {this.props.subSection}
				</h4>
			</div>
		);
	}
}

export default App;
