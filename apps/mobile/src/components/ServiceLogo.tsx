import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { findServicePresetByProvider, normalizeCatalogKey } from "@subly/shared";

import { colors } from "../theme";
import {
  getSubscriptionInitials,
  getSubscriptionPalette
} from "../utils/subscriptionVisuals";

type ServiceLogoProps = {
  providerName: string;
  size?: number;
};

type LogoConfig = {
  label: string;
  background: string;
  foreground: string;
  border: string;
  fontScale: number;
};

type ImagePlateTheme = {
  background: string;
  border: string;
};

const LOGO_CONFIGS: Record<string, LogoConfig> = {
  chatgpt: { label: "AI", background: "#FFFFFF", foreground: "#12151C", border: "#E5E7EB", fontScale: 0.26 },
  claude: { label: "C", background: "#E77344", foreground: "#FFF5EF", border: "#F09167", fontScale: 0.42 },
  google_gemini: { label: "G", background: "#FFFFFF", foreground: "#7C6DFF", border: "#E3E5F5", fontScale: 0.42 },
  microsoft_copilot: { label: "Co", background: "#FFF6E8", foreground: "#111827", border: "#F0D8AF", fontScale: 0.24 },
  perplexity_ai: { label: "P", background: "#101114", foreground: "#F3F4F6", border: "#2D3342", fontScale: 0.4 },
  meta_ai: { label: "M", background: "#F5F7FF", foreground: "#5170FF", border: "#D8DFFF", fontScale: 0.4 },
  netflix: { label: "N", background: "#170506", foreground: "#E50914", border: "#321014", fontScale: 0.5 },
  youtube: { label: "YT", background: "#FFFFFF", foreground: "#FF1F3D", border: "#E5E7EB", fontScale: 0.24 },
  amazon_prime: { label: "P", background: "#1877F2", foreground: "#EAF3FF", border: "#2F86FF", fontScale: 0.4 },
  disney_plus: { label: "D+", background: "#0C1F52", foreground: "#F5F7FA", border: "#213A7A", fontScale: 0.32 },
  hulu: { label: "h", background: "#0B1813", foreground: "#1CE783", border: "#224133", fontScale: 0.42 },
  hbo_max: { label: "max", background: "#101422", foreground: "#F4F2FF", border: "#252D46", fontScale: 0.18 },
  apple_tv_plus: { label: "tv", background: "#171717", foreground: "#F5F7FA", border: "#313131", fontScale: 0.24 },
  paramount_plus: { label: "P+", background: "#1361F5", foreground: "#EFF5FF", border: "#2F74FF", fontScale: 0.22 },
  peacock_tv: { label: "P", background: "#151515", foreground: "#F3F4F6", border: "#303030", fontScale: 0.38 },
  discovery: { label: "D", background: "#101F7C", foreground: "#F1F5FF", border: "#24359C", fontScale: 0.38 },
  crunchyroll: { label: "C", background: "#FF6B00", foreground: "#FFF5EC", border: "#FF8C36", fontScale: 0.38 },
  spotify: { label: "S", background: "#1DB954", foreground: "#04160D", border: "#36D06F", fontScale: 0.46 },
  apple_music: { label: "AM", background: "#FFF1F4", foreground: "#F53C6B", border: "#FFD4DE", fontScale: 0.2 },
  deezer: { label: "DZ", background: "#131622", foreground: "#F5F7FA", border: "#2B3046", fontScale: 0.2 },
  tidal: { label: "T", background: "#0D0D0D", foreground: "#FFFFFF", border: "#2B2B2B", fontScale: 0.38 },
  amazon_music: { label: "AM", background: "#14243A", foreground: "#8FDDFF", border: "#274060", fontScale: 0.2 },
  youtube_music: { label: "YM", background: "#121316", foreground: "#FF3251", border: "#2A2D33", fontScale: 0.2 },
  soundcloud_go: { label: "SC", background: "#FFF4EB", foreground: "#FF6A00", border: "#FFD7BC", fontScale: 0.2 },
  xbox_game_pass: { label: "X", background: "#107C10", foreground: "#F5FFF5", border: "#2A9A2A", fontScale: 0.4 },
  playstation_plus: { label: "PS", background: "#0168D4", foreground: "#EFF7FF", border: "#2182E6", fontScale: 0.22 },
  nintendo_switch_online: { label: "NS", background: "#F1242D", foreground: "#FFF4F4", border: "#FF5B62", fontScale: 0.22 },
  ea_play: { label: "EA", background: "#171717", foreground: "#F5F7FA", border: "#2E2E2E", fontScale: 0.22 },
  ubisoft_plus: { label: "U", background: "#F3F3F9", foreground: "#4338CA", border: "#DBDBEE", fontScale: 0.36 },
  geforce_now: { label: "GF", background: "#090F08", foreground: "#76B900", border: "#223819", fontScale: 0.2 },
  notion: { label: "N", background: "#F5F5F4", foreground: "#111111", border: "#DDDDDD", fontScale: 0.44 },
  slack: { label: "S", background: "#F8F8FB", foreground: "#4A154B", border: "#E2E2EF", fontScale: 0.36 },
  jira: { label: "J", background: "#EAF1FF", foreground: "#1868DB", border: "#CDDCF8", fontScale: 0.38 },
  trello: { label: "T", background: "#EAF4FF", foreground: "#0C66E4", border: "#D3E5FA", fontScale: 0.38 },
  zoom_pro: { label: "Zm", background: "#0B5CFF", foreground: "#F4F8FF", border: "#2670FF", fontScale: 0.22 },
  lastpass: { label: "...", background: "#D61F45", foreground: "#FFF2F5", border: "#F0496D", fontScale: 0.18 },
  one_password: { label: "1", background: "#F3F6FB", foreground: "#1463D6", border: "#D7E3F6", fontScale: 0.42 },
  figma: { label: "F", background: "#111111", foreground: "#FFFFFF", border: "#2B2B2B", fontScale: 0.26 },
  adobe_creative_cloud: { label: "Ae", background: "#A4061D", foreground: "#FFD5DC", border: "#D13B51", fontScale: 0.24 },
  peloton_digital: { label: "p", background: "#090909", foreground: "#F5F7FA", border: "#2A2A2A", fontScale: 0.44 },
  classpass: { label: "C", background: "#0B5CFF", foreground: "#EAF3FF", border: "#2971FF", fontScale: 0.4 },
  calm: { label: "Calm", background: "#5B7CFF", foreground: "#F1F5FF", border: "#7794FF", fontScale: 0.16 },
  headspace: { label: "H", background: "#FFF4E8", foreground: "#FF7A00", border: "#FFD6B0", fontScale: 0.4 },
  noom: { label: "N", background: "#FF694F", foreground: "#FFF4F0", border: "#FF8A74", fontScale: 0.38 },
  weight_watchers: { label: "WW", background: "#4353FF", foreground: "#EEF1FF", border: "#6674FF", fontScale: 0.18 },
  betterhelp: { label: "B", background: "#F2FAF4", foreground: "#3E8F5E", border: "#D7F0DE", fontScale: 0.38 },
  myfitnesspal: { label: "M", background: "#0B65D8", foreground: "#EFF6FF", border: "#267CEB", fontScale: 0.38 },
  fitbit_premium: { label: "F", background: "#0AAFC0", foreground: "#EEFCFF", border: "#33C4D0", fontScale: 0.38 },
  whoop: { label: "W", background: "#FF5C2A", foreground: "#FFF4EE", border: "#FF7D57", fontScale: 0.38 },
  fitness_park: { label: "FP", background: "#1A1A1A", foreground: "#FF8A3D", border: "#343434", fontScale: 0.18 },
  on_air: { label: "OA", background: "#15162A", foreground: "#E8ECFF", border: "#313457", fontScale: 0.18 },
  basic_fit: { label: "BF", background: "#FFF4E8", foreground: "#FF7B00", border: "#FFD5B0", fontScale: 0.18 },
  neoness: { label: "N", background: "#D91E5B", foreground: "#FFF3F7", border: "#F25686", fontScale: 0.4 },
  keep_cool: { label: "KC", background: "#F1FFF5", foreground: "#1B8E47", border: "#D2F1DD", fontScale: 0.18 },
  orange_bleue: { label: "OB", background: "#EAF5FF", foreground: "#1772C9", border: "#CFE5F7", fontScale: 0.18 },
  cmg_sports_club: { label: "CMG", background: "#F4F0FF", foreground: "#5A34C8", border: "#DED3FA", fontScale: 0.14 },
  vita_liberte: { label: "VL", background: "#F2FFF6", foreground: "#1E9B5C", border: "#D4F3E0", fontScale: 0.18 },
  gigafit: { label: "GF", background: "#FFFBEA", foreground: "#B89110", border: "#F5E7B0", fontScale: 0.18 },
  magic_form: { label: "MF", background: "#FFF0F4", foreground: "#D63468", border: "#F8CAD8", fontScale: 0.18 },
  turbotax: { label: "TT", background: "#F6372F", foreground: "#FFF4F3", border: "#FF6B64", fontScale: 0.18 },
  quickbooks: { label: "qb", background: "#2CA01C", foreground: "#F4FFF2", border: "#49B53B", fontScale: 0.2 },
  robinhood_gold: { label: "R", background: "#D7FF00", foreground: "#121816", border: "#EAFF6A", fontScale: 0.38 },
  monzo_plus: { label: "M", background: "#173E52", foreground: "#EAF9FF", border: "#295874", fontScale: 0.38 },
  revolut: { label: "R", background: "#F7F7F7", foreground: "#131313", border: "#E3E3E3", fontScale: 0.38 },
  codecademy: { label: "C", background: "#151B44", foreground: "#F0F4FF", border: "#283163", fontScale: 0.38 },
  babbel: { label: "B", background: "#FF6A00", foreground: "#FFF5EC", border: "#FF8D34", fontScale: 0.38 },
  rosetta_stone: { label: "R", background: "#FFC61A", foreground: "#17314B", border: "#FFD35C", fontScale: 0.38 },
  busuu: { label: "B", background: "#4C8DFF", foreground: "#F1F6FF", border: "#70A5FF", fontScale: 0.38 },
  memrise: { label: "M", background: "#FFC929", foreground: "#1D2433", border: "#FFD962", fontScale: 0.36 },
  coursera: { label: "C", background: "#2A73FF", foreground: "#F1F6FF", border: "#4B88FF", fontScale: 0.38 },
  skillshare: { label: "Sk", background: "#112131", foreground: "#E2FFF5", border: "#1F3848", fontScale: 0.18 },
  masterclass: { label: "M", background: "#1B1B1D", foreground: "#FF5D88", border: "#34343A", fontScale: 0.36 },
  duolingo: { label: "D", background: "#7BEA39", foreground: "#173A05", border: "#99F169", fontScale: 0.42 },
  udemy: { label: "U", background: "#F6F5FF", foreground: "#5A32B7", border: "#E0DCF7", fontScale: 0.38 },
  linkedin_learning: { label: "in", background: "#0A66C2", foreground: "#EFF6FF", border: "#2B7ACC", fontScale: 0.18 },
  blinkist: { label: "B", background: "#F3FBF1", foreground: "#4AA52E", border: "#D8EFD1", fontScale: 0.38 },
  surfshark: { label: "S", background: "#F0FFFB", foreground: "#2ABFB4", border: "#CBF3EC", fontScale: 0.38 },
  nordvpn: { label: "N", background: "#EAF1FF", foreground: "#3269FF", border: "#D3DFFF", fontScale: 0.38 },
  expressvpn: { label: "E", background: "#FFEEF0", foreground: "#E31B3A", border: "#FFD3DA", fontScale: 0.38 },
  audible: { label: "A", background: "#FFB037", foreground: "#FFF7EE", border: "#FFC663", fontScale: 0.38 },
  scribd: { label: "&", background: "#F9F84A", foreground: "#232323", border: "#FBF978", fontScale: 0.38 },
  comcast_xfinity: { label: "X", background: "#6C42F0", foreground: "#F4F1FF", border: "#8967F5", fontScale: 0.38 },
  patreon: { label: "P", background: "#0A0A0A", foreground: "#F5F7FA", border: "#2C2C2C", fontScale: 0.38 },
  twitch_turbo: { label: "Tw", background: "#8B46FF", foreground: "#F6F0FF", border: "#A56BFF", fontScale: 0.18 },
  airbnb: { label: "A", background: "#FF4F66", foreground: "#FFF4F6", border: "#FF7386", fontScale: 0.36 },
  uber: { label: "U", background: "#080808", foreground: "#F5F7FA", border: "#272727", fontScale: 0.38 },
  grab: { label: "G", background: "#F2FFF6", foreground: "#26B14C", border: "#D6F5E0", fontScale: 0.38 },
  citymapper: { label: "C", background: "#38B844", foreground: "#F4FFF4", border: "#59C763", fontScale: 0.38 },
  tinder: { label: "T", background: "#FF5D6F", foreground: "#FFF4F5", border: "#FF7E8D", fontScale: 0.38 },
  bumble: { label: "B", background: "#FFC937", foreground: "#1E1D18", border: "#FFD55E", fontScale: 0.38 },
  hinge: { label: "H", background: "#F6F0E8", foreground: "#232323", border: "#E8DDCF", fontScale: 0.38 },
  okcupid: { label: "ok", background: "#D617FF", foreground: "#FFF0FF", border: "#E34DFF", fontScale: 0.18 },
  eharmony: { label: "e", background: "#389A77", foreground: "#F0FFF9", border: "#5AB18F", fontScale: 0.38 },
  doordash_dashpass: { label: "D", background: "#FFF2EE", foreground: "#F0441B", border: "#FFD5CA", fontScale: 0.38 },
  ubereats: { label: "UE", background: "#1FD66B", foreground: "#09130D", border: "#4CE387", fontScale: 0.18 },
  postmates: { label: "P", background: "#181818", foreground: "#F5F7FA", border: "#2B2B2B", fontScale: 0.38 },
  instacart: { label: "I", background: "#FFF7ED", foreground: "#FF7A00", border: "#FFE1BE", fontScale: 0.38 },
  hellofresh: { label: "HF", background: "#B4ED30", foreground: "#193100", border: "#C7F160", fontScale: 0.18 },
  blue_apron: { label: "BA", background: "#F5F9FF", foreground: "#1D4FA8", border: "#DCE6F7", fontScale: 0.18 },
  verizon_wireless: { label: "V", background: "#FFF2F2", foreground: "#E91B2D", border: "#FFD5D8", fontScale: 0.38 },
  att_wireless: { label: "AT", background: "#0080C9", foreground: "#F0FAFF", border: "#2695D8", fontScale: 0.18 },
  google_fi: { label: "Fi", background: "#F5F7FA", foreground: "#2B6DF3", border: "#DCE1EA", fontScale: 0.18 },
  mint_mobile: { label: "M", background: "#9FD6AF", foreground: "#F7FFFA", border: "#B3E0C0", fontScale: 0.38 },
  google_one: { label: "G1", background: "#FFFFFF", foreground: "#111827", border: "#D5D8E1", fontScale: 0.24 },
  icloud_plus: { label: "iC", background: "#D6E8FF", foreground: "#1F4C8E", border: "#B7D3FF", fontScale: 0.24 }
};

const OFFICIAL_LOGO_HOSTS: Record<string, string> = {
  chatgpt: "chatgpt.com",
  claude: "claude.ai",
  google_gemini: "gemini.google.com",
  microsoft_copilot: "copilot.microsoft.com",
  perplexity_ai: "perplexity.ai",
  meta_ai: "meta.ai",
  netflix: "www.netflix.com",
  youtube: "www.youtube.com",
  amazon_prime: "www.primevideo.com",
  disney_plus: "www.disneyplus.com",
  hulu: "www.hulu.com",
  hbo_max: "play.max.com",
  apple_tv_plus: "tv.apple.com",
  paramount_plus: "www.paramountplus.com",
  peacock_tv: "www.peacocktv.com",
  discovery: "www.discoveryplus.com",
  crunchyroll: "www.crunchyroll.com",
  spotify: "open.spotify.com",
  apple_music: "music.apple.com",
  deezer: "www.deezer.com",
  tidal: "tidal.com",
  amazon_music: "music.amazon.com",
  youtube_music: "music.youtube.com",
  soundcloud_go: "soundcloud.com",
  xbox_game_pass: "www.xbox.com",
  playstation_plus: "www.playstation.com",
  nintendo_switch_online: "www.nintendo.com",
  ea_play: "www.ea.com",
  ubisoft_plus: "store.ubisoft.com",
  geforce_now: "play.geforcenow.com",
  notion: "www.notion.so",
  slack: "slack.com",
  jira: "www.atlassian.com",
  trello: "trello.com",
  zoom_pro: "zoom.us",
  lastpass: "www.lastpass.com",
  one_password: "1password.com",
  figma: "www.figma.com",
  adobe_creative_cloud: "www.adobe.com",
  peloton_digital: "www.onepeloton.com",
  classpass: "classpass.com",
  calm: "www.calm.com",
  headspace: "www.headspace.com",
  noom: "www.noom.com",
  weight_watchers: "www.weightwatchers.com",
  betterhelp: "www.betterhelp.com",
  myfitnesspal: "www.myfitnesspal.com",
  fitbit_premium: "www.fitbit.com",
  whoop: "www.whoop.com",
  fitness_park: "www.fitnesspark.fr",
  on_air: "www.onair-fitness.fr",
  basic_fit: "www.basic-fit.com",
  neoness: "www.neoness.fr",
  keep_cool: "www.keepcool.fr",
  orange_bleue: "www.lorangebleue.fr",
  cmg_sports_club: "www.cmgsportsclub.com",
  vita_liberte: "www.vitaliberte.fr",
  gigafit: "www.gigafit.fr",
  magic_form: "www.magic-form.fr",
  turbotax: "turbotax.intuit.com",
  quickbooks: "quickbooks.intuit.com",
  robinhood_gold: "robinhood.com",
  monzo_plus: "monzo.com",
  revolut: "www.revolut.com",
  codecademy: "www.codecademy.com",
  babbel: "www.babbel.com",
  rosetta_stone: "www.rosettastone.com",
  busuu: "www.busuu.com",
  memrise: "www.memrise.com",
  coursera: "www.coursera.org",
  skillshare: "www.skillshare.com",
  masterclass: "www.masterclass.com",
  duolingo: "www.duolingo.com",
  udemy: "www.udemy.com",
  linkedin_learning: "www.linkedin.com",
  blinkist: "www.blinkist.com",
  surfshark: "surfshark.com",
  nordvpn: "nordvpn.com",
  expressvpn: "www.expressvpn.com",
  audible: "www.audible.com",
  scribd: "www.scribd.com",
  comcast_xfinity: "www.xfinity.com",
  patreon: "www.patreon.com",
  twitch_turbo: "www.twitch.tv",
  airbnb: "www.airbnb.com",
  uber: "www.uber.com",
  grab: "www.grab.com",
  citymapper: "citymapper.com",
  tinder: "tinder.com",
  bumble: "bumble.com",
  hinge: "hinge.co",
  okcupid: "www.okcupid.com",
  eharmony: "www.eharmony.com",
  doordash_dashpass: "www.doordash.com",
  ubereats: "www.ubereats.com",
  postmates: "postmates.com",
  instacart: "www.instacart.com",
  hellofresh: "www.hellofresh.com",
  blue_apron: "www.blueapron.com",
  verizon_wireless: "www.verizon.com",
  att_wireless: "www.att.com",
  google_fi: "fi.google.com",
  mint_mobile: "www.mintmobile.com",
  google_one: "one.google.com",
  icloud_plus: "www.icloud.com"
};

const DEFAULT_IMAGE_PLATE: ImagePlateTheme = {
  background: "#FFFFFF",
  border: "#E6E8EF"
};

const DARK_IMAGE_PLATE: ImagePlateTheme = {
  background: "#111216",
  border: "#2A2D35"
};

const IMAGE_PLATE_THEMES: Record<string, ImagePlateTheme> = {
  apple_tv_plus: DARK_IMAGE_PLATE,
  tidal: DARK_IMAGE_PLATE,
  uber: DARK_IMAGE_PLATE,
  postmates: DARK_IMAGE_PLATE,
  patreon: DARK_IMAGE_PLATE,
  hbo_max: DARK_IMAGE_PLATE,
  twitch_turbo: DARK_IMAGE_PLATE,
  comcast_xfinity: DARK_IMAGE_PLATE,
  notion: DEFAULT_IMAGE_PLATE,
  spotify: DEFAULT_IMAGE_PLATE,
  paramount_plus: DEFAULT_IMAGE_PLATE,
  crunchyroll: DEFAULT_IMAGE_PLATE
};

export function ServiceLogo({
  providerName,
  size = 48
}: ServiceLogoProps): JSX.Element {
  const preset = findServicePresetByProvider(providerName);
  const providerKey = normalizeCatalogKey(providerName);
  const logoKey = preset?.id ?? providerKey;
  const palette = getSubscriptionPalette(providerName);
  const [didImageFail, setDidImageFail] = useState(false);

  useEffect(() => {
    setDidImageFail(false);
  }, [logoKey]);

  const borderRadius = Math.round(size * 0.34);
  const baseStyle = {
    width: size,
    height: size,
    borderRadius
  } as const;

  const logoConfig = LOGO_CONFIGS[logoKey] ?? {
    label: getSubscriptionInitials(providerName),
    background: "rgba(255,255,255,0.06)",
    foreground: palette.solid,
    border: colors.borderStrong,
    fontScale: 0.3
  };

  const logoUri = useMemo(() => {
    const host = OFFICIAL_LOGO_HOSTS[logoKey];

    if (!host) {
      return null;
    }

    return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(
      `https://${host}`
    )}`;
  }, [logoKey]);

  const imageSize = Math.round(size * 0.68);
  const imagePlateSize = Math.round(size * 0.76);
  const imagePlateTheme = IMAGE_PLATE_THEMES[logoKey] ?? DEFAULT_IMAGE_PLATE;
  const isUsingRemoteLogo = Boolean(logoUri && !didImageFail);

  return (
    <View
      style={[
        styles.base,
        baseStyle,
        {
          backgroundColor: isUsingRemoteLogo ? "rgba(255,255,255,0.04)" : logoConfig.background,
          borderColor: isUsingRemoteLogo ? colors.borderStrong : logoConfig.border
        }
      ]}
    >
      {isUsingRemoteLogo ? (
        <View
          style={[
            styles.imagePlate,
            {
              width: imagePlateSize,
              height: imagePlateSize,
              borderRadius: Math.round(imagePlateSize * 0.28),
              backgroundColor: imagePlateTheme.background,
              borderColor: imagePlateTheme.border
            }
          ]}
        >
          <Image
            source={{ uri: logoUri! }}
            style={{
              width: imageSize,
              height: imageSize,
              borderRadius: Math.round(imageSize * 0.22)
            }}
            resizeMode="contain"
            onError={() => setDidImageFail(true)}
          />
        </View>
      ) : (
        <Text
          style={[
            styles.logoLabel,
            {
              color: logoConfig.foreground,
              fontSize: Math.max(10, Math.round(size * logoConfig.fontScale))
            }
          ]}
        >
          {logoConfig.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden"
  },
  imagePlate: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  logoLabel: {
    fontWeight: "800",
    letterSpacing: -0.3
  }
});
