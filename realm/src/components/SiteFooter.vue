<template>
    <footer class="site-banner site-banner--secondary">
        <div class="footer__sig">
            By <b style="font-family: monospace;">eitri</b>
            (discord /
            <a
                href="https://twitter.com/eittri"
                rel="nofollow noopener noreferrer"
                class="site-banner__link"
                title="eittri on twitter"
            >
                <span class="sr-only">
                    twitter
                </span>
                <SiteIcon
                    name="twitter"
                    class="footer__twitter-icon"
                />
            </a>)
            - feedback welcome!
        </div>
        <div>
            <a
                href="https://github.com/mistaya/aavegotchi/tree/main/realm"
                rel="nofollow noopener noreferrer"
                class="site-banner__link"
            >
                Source code
            </a>
        </div>
        <div>
            <a
                href="https://polygonscan.com/address/0xaf4fe811ffa1bf1f7de8fdaa9f706487c882aed0"
                rel="nofollow noopener noreferrer"
                class="site-banner__link footer__donate"
            >
                Donate
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 13 15"
                    class="footer__mug"
                    alt="gotchi mug"
                >
                    <g fill="#d3cadf" class="footer__mug-steam">
                        <path d="M2,0h1v1H2V0z"/><path d="M3,1h1v1H3V1z"/><path d="M4,2h1v1H4V2z"/><path d="M3,3h1v1H3V3z"/><path d="M2 4h1v2H2V4zm4-4h1v1H6V0z"/><path d="M7,1h1v1H7V1z"/><path d="M8,2h1v1H8V2z"/><path d="M7,3h1v1H7V3z"/><path d="M6,4h1v2H6V4z"/>
                    </g>
                    <g fill="#64438e">
                        <path d="M0,5v9h1v1h8v-1h1v-2h2v-1h-2V8h2V7h-2V5H0z"/><path d="M12,8v3h1V8H12z"/>
                    </g>
                    <path d="M1 14h8V6H1v8z" fill="#fff"/><path d="M8,6v8h1V6H8z" fill="#d3cadf"/><path d="M7.1 8.3v-.9H5.4v.9h-.8v-.9H2.9v.9H2v1.8h.9v.9h.8v.9h.9v.9h.9v-.9h.8V11h.9v-.9H8V8.3h-.9z" fill="#fa34f3"/><path d="M4.6 11.9h.9v.9h-.9v-.9z" fill="#7e18f8"/><path d="M3.7 11v.9h2.6V11H3.7h0z" fill="#8f17f9"/><path d="M2.9 10.1v.9h4.3v-.9H2.9z" fill="#ac15f9"/><path d="M2 9.2v.9h6v-.9H2z" fill="#cf15f9"/><path d="M7.1 8.3v-.9H5.4v.9h-.8v-.9H2.9v.9H2v.9h6v-.9h-.9z" fill="#fa34f3"/>
                </svg>
            </a>
        </div>
    </footer>
</template>

<script>
export default {
}
</script>

<style scoped>
  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 10px 0 13px;
  }
  footer > div {
    flex: 0 0 auto;
    padding: 5px 15px;
  }
  @media (max-width: 660px) {
      .footer__sig {
        width: 100%;
        text-align: center;
      }
  }
  .footer__donate {
    padding-right: 22px;
  }

  .footer__twitter-icon {
    position: relative;
    top: 2px;
  }

  .footer__mug {
    position: absolute;
    margin-top: -2px;
    margin-left: 5px;
    width: 20px;
    height: 20px;
    will-change: transform;
  }

  .footer__mug-steam {
    transform-origin: 38%;
    will-change: transform;
    fill: #d3cadf;
  }
  .footer__donate:hover .footer__mug-steam {
    animation: rotate-steam 1.2s step-end infinite;
  }

  @keyframes rotate-steam {
    0% {
        transform: rotateY(180deg);
    }
    49% {
        transform: rotateY(180deg);
    }
    50% {
        transform: rotateY(0deg);
    }
    100% {
        transform: rotateY(0deg);
    }
  }

  .footer__mug {
    filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.4));
  }
  .footer__donate:hover .footer__mug {
    filter: drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.5));
  }
</style>
