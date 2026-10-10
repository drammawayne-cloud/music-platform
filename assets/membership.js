import {membershipCards} from './membership-cards.js?v=20261010-cover';
const area=document.querySelector('#membership-plans');area.replaceChildren(membershipCards(tier=>location.assign('/addons/membership/?plan='+tier.id)));
