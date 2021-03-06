/* eslint-disable no-param-reassign,class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faExclamation, faInfo } from '@fortawesome/free-solid-svg-icons';
import * as KeyBox from '../../utils/keybox';
import FormComponent from '../../components/FormComponent';
import Form from '../../components/atoms/Form';
import Button from '../../components/atoms/Button';
import ButtonLink from '../../components/atoms/ButtonLink';
import Box from '../../components/atoms/Box';
import LoaderOverlay from '../../components/atoms/LoaderOverlay';
import Logo from '../../components/Logo/Logo';
import config from '../../config/config';
import style from './RegisterPage.css';

export default class RegisterPage extends FormComponent {

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password2: '',
      seedPhrase: KeyBox.generateSeedPhrase(),
      isSubmitted: false,
    };
  }

  validatePasswords() {
    const password2 = document.querySelector('[name=password2]');
    if (this.state.password !== this.state.password2) {
      password2.setCustomValidity("Passwords don't match");
      return false;
    }

    password2.setCustomValidity('');
    return true;
  }

  handlePasswordChange = (event) => {
    this.handleInputChange(event, this.validatePasswords);
  }

  handlePasswordSubmit = (event) => {
    if (this.validatePasswords()) {
      event.preventDefault();
      event.stopPropagation();
      this.props.history.push('/register/terms');
    }
  }

  handleSeedPhraseRefresh = (event, callback) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({
      seedPhrase: KeyBox.generateSeedPhrase()
    }, callback);
  }

  handleSeedPhraseSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.state.password && this.state.seedPhrase) {
      this.setState({
        isSubmitted: true
      }, () => {
        setTimeout(() => {
          this.props.registerAction(
            this.state.password,
            this.state.seedPhrase,
            () => this.props.history.push('/')
          );
        }, 0);
      });
    } else {
      this.props.history.push('/register');
    }
  }

  renderWelcomePage() {
    return (
      <div className={style.welcomePage}>
        <header className={style.logo}>
          <Logo withoutName />
          <h1>Live by ADS</h1>
          {config.testnet ? <h3>TESTNET</h3> : ''}
        </header>
        <p className={style.about}>{config.about}</p>
        <ButtonLink to="/register/password" icon="right" layout="info">
          Start <FontAwesomeIcon icon={faChevronRight} />
        </ButtonLink>
        <div className={style.links}>
          <Link to={'/restore'}>Restore the vault from a seed</Link><br />
          {config.testnet ?
            <Link to={'/mainnet'} className={style.mainnetLink}>Switch to the mainnet</Link> :
            <Link to={'/testnet'}>Switch to the testnet</Link>
          }
        </div>
      </div>
    );
  }

  renderNewPasswordPage() {
    return (
      <div className={style.newPasswordPage}>
        <header>
          <h1>Setup password</h1>
          {config.testnet ? <h3>TESTNET</h3> : ''}
        </header>
        <Box icon={faInfo} layout="info">
          Your password should be obscure and must be at
          least {config.passwordMinLength} characters long.
        </Box>
        <Form onSubmit={this.handlePasswordSubmit}>
          <div>
            <input
              type="password"
              autoFocus
              required
              placeholder="Password"
              minLength={config.passwordMinLength}
              name="password"
              value={this.state.password}
              onChange={this.handlePasswordChange}
            />
          </div>
          <div>
            <input
              type="password"
              required
              placeholder="Confirm password"
              minLength={config.passwordMinLength}
              name="password2"
              value={this.state.password2}
              onChange={this.handlePasswordChange}
            />
          </div>
          <div className={style.buttons}>
            <ButtonLink to={'/register'} inverse icon="left" layout="info">
              <FontAwesomeIcon icon={faChevronLeft} /> Back
            </ButtonLink>
            <Button type="subbmit" icon="right" layout="info">
              Next <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  renderTermsPage() {
    return (
      <div className={style.termsPage}>
        <header>
          <h1>Terms of Use</h1>
          {config.testnet ? <h3>TESTNET</h3> : ''}
        </header>
        <div className={style.terms}>{config.terms}</div>
        <div className={style.buttons}>
          <ButtonLink to={'/register/password'} inverse icon="left" layout="info">
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </ButtonLink>
          <ButtonLink to={'/register/seed'} icon="right" layout="info">
            Accept <FontAwesomeIcon icon={faChevronRight} />
          </ButtonLink>
        </div>
      </div>
    );
  }

  renderSeedPhrasePage() {
    return (
      <div className={style.seedPhrasePage}>
        {this.state.isSubmitted && <LoaderOverlay />}
        <header>
          <h1>Mnemonic seed phrase</h1>
          {config.testnet ? <h3>TESTNET</h3> : ''}
        </header>
        <Box title="Warning" layout="warning" icon={faExclamation}>
          A seed phrase includes all the information needed to recover a wallet.
          Please write it down on paper and store safely.
        </Box>
        <Form onSubmit={this.handleSeedPhraseSubmit}>
          <div className={style.refresh}>
            <Button
              onClick={this.handleSeedPhraseRefresh}
              size="small"
              inverse
            >
              Regenerate phrase
            </Button>
          </div>
          <div className={style.dangerContent}>
            <textarea
              value={this.state.seedPhrase}
              readOnly
            />
          </div>
          <div className={style.buttons}>
            <ButtonLink
              to={'/register/terms'}
              inverse
              icon="left"
              layout="info"
              disabled={this.state.isSubmitted}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Back
            </ButtonLink>
            <Button
              type="submit"
              icon="right"
              layout="info"
              disabled={this.state.isSubmitted}
            >
              Save <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  render() {
    const { step } = this.props.match.params;

    switch (step) {
      case 'password':
        return this.renderNewPasswordPage();
      case 'terms':
        return this.renderTermsPage();
      case 'seed':
        return this.renderSeedPhrasePage();
      default:
        return this.renderWelcomePage();
    }
  }
}

RegisterPage.propTypes = {
  registerAction: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};
