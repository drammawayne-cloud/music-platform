import {membershipCards} from './membership-cards.js?v=membership-pricing-20261001';
const area=document.querySelector('#membership-plans');area.replaceChildren(membershipCards(tier=>location.assign('https://console.richrowmusic.com/addons/membership?plan='+tier.id)));
