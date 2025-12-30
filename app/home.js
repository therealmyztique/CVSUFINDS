import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { homeStyles as styles } from "./styles/homeStyles";

const FILTERS = ["All", "Lost", "Found"];

const FILTER_COLORS = {
  All: {
    lightBg: "#0f172a",
    darkBg: "#f8fafc",
    lightText: "#f8fafc",
    darkText: "#0b1610",
  },
  Lost: {
    lightBg: "#f43f5e",
    darkBg: "#fb7185",
    lightText: "#ffffff",
    darkText: "#0b1610",
  },
  Found: {
    lightBg: "#2bee79",
    darkBg: "#2bee79",
    lightText: "#0b1610",
    darkText: "#0b1610",
  },
};

const SAMPLE_POSTS = [
  {
    id: "post-1",
    title: "Blue Hydroflask",
    status: "Found",
    location: "Main Library",
    author: "Jane D.",
    timeAgo: "2m",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXLo-WFc178_LYlcFlHoJactKVUPNi6I1y-PlT_CCcQ1yIeGzb-SQyHNze0NFx63_fr8O3izJyj2eaMKps78PfLhEeJsncOImPawm-MbekCdnUxbC5DFBdsFNdftdnLsBNsTrVMMwWTGBwlNgaN9gymaDTc2OJrM9nTnpWxDV9N2sjmhowA3q7ki9dKK9w2j34wU2fCyn5tNp8fwGuzKhQ4xxgvcrBXe6hkHvpaNJ99yT9C7KFFJCSfUwlUycbyVI3kBqJv8AN5j4f",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBh8W6mP1qZuZy6K36a5Jmy3rRQ1chP_HQ8xs595qGdlcVOJ0W4f1HuM1PMurQHZzLAw3FDLGqmo9spxk5hwzbV8VJoRJ7un0PXf1YqETPyJFqD7jMsYh6vyGcZ55591tnxzgXdyDYM1cyjToAqeMST408lqG20-pVwMG_p9Cz7fJZA20--mWEhu0asePkAVYmvXUpf_xOhUHBwq_IogZFgW-66QocR-DSJPmEcDWtk2H6dTfryetPerY-RdM0ugJ8YpCZb5Oosm-PI",
  },
  {
    id: "post-2",
    title: "Rayban Glasses",
    status: "Lost",
    location: "CEIT Bldg",
    author: "Marco P.",
    timeAgo: "1h",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBd5cLNLHoAihs7bFjokbobMCNvYfwjFmyjl2whlBSM-GcbC-o7kqWbcJbi8bqyFpHhsBhrjZWDQxGTHK5W9PiAYK6tm-Q0zg-oTrtgxhuH0wIzdkcAyv01ibJvZgL5M9n30K-RC2QuGTEKG2GyZSu47EsTiyAhVZvjqHqKo48j8WdOdLaimVMu8YXX4IGjKcfWhBftv2tpmWXdWuBK9xsRgleQM1b4bucvdM9VDV06LCoDmjiYvAZUbtefEByis9A7_3FdW6qVwH8g",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdYhcS3rCVRtbD_2430CdkW9YqMsXwAmEtuAjt7xG7h59szfwEyouHUmSASiL0L3XfEdScxO3VVsNP85gJ_KoTy74DpCiP5dx3Stik5T207FcHbbKLRK-XSr3IhjKgiBUwZwy0rtP-Bx0MguWWYmcFcmXFZPWp4CYO7VBmpQoF7ZU6-qQPAxb4SUNKEA9Uzy_M7zASs77C-63KqatOGKqqonlzB-OotLZGt84Qc5yFyOQuJ5VFykYHfyqRA14QrtwfOrvsSJwjVBHK",
  },
  {
    id: "post-3",
    title: "Casio Watch",
    status: "Found",
    location: "Uni Gym",
    author: "Sarah L.",
    timeAgo: "3h",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA5Vi1SaaSSVruvfQtAZe72_whAUvVcKRI4Wh-6sBvcjhjQ-wNi6oXrVaZL687h9WiGa5NsR38I3HieU-zKS2FbPz0rdJXLvAL7zL5JKdjKOSAa6K9Rvprf57kzQG2YYCdpfAezE3mcsk6ytIt_HeICMaPNE4IZ_944LQHdNcxMWyo7IrHWYO-m6cv0F3u70CsJBbQKDEhJwbNHJus7leJ-g5kSRImapUIYO7kZNapr5On6IHe_HR5jkwOw3bu_sIiZz1zI4_GnIitV",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMwugAQhVyU8br820pSs63OHdg1BVwmsdxA4XtK0SryclCgbgUCgCFM5ucO4sM3oFQnENT0tdVC930JdW2vJN6krOwO0Qax2whqPQFeGBJp_RGPdliMhO_6OG45sfznK7Uxq1j1jF7dg3R86pJyHEheUjKBwV0MpWLBMTp6WIUw_3yroDlI4IYeBGOZDrbbHJhzBT848ySOIlJoJJul0c1Aeg8uBtmqj0NkZXgzqukT5jUTalYf2xfok_diqRorNvWYkbXRhWS2q3h",
  },
];

const PRIMARY_COLOR = "#2bee79";
const SURFACE_ICON_COLOR = "#102217";
const LIGHT_TEXT_COLOR = "#0f172a";
const DARK_TEXT_COLOR = "#f8fafc";
const MUTED_LIGHT_COLOR = "#64748b";
const MUTED_DARK_COLOR = "#94a3b8";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeFilter, setActiveFilter] = useState("All");

  const baseTextColor = isDark ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR;
  const mutedTextColor = isDark ? MUTED_DARK_COLOR : MUTED_LIGHT_COLOR;

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") {
      return SAMPLE_POSTS;
    }
    return SAMPLE_POSTS.filter((post) => post.status === activeFilter);
  }, [activeFilter]);

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View
        style={[
          styles.header,
          isDark ? styles.headerSurfaceDark : styles.headerSurfaceLight,
          styles.headerShadow,
          isDark ? styles.headerShadowDark : null,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.bellButton, isDark ? styles.bellButtonDark : styles.bellButtonLight]}
        >
          <MaterialIcons
            name="notifications"
            size={26}
            color={baseTextColor}
          />
          <View style={styles.bellBadge} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text
            style={[styles.headerTitleText, isDark ? styles.headerTitleDark : styles.headerTitleLight]}
          >
            CvSU
          </Text>
          <Text style={[styles.headerTitleText, styles.headerTitleAccent]}>Finds</Text>
        </View>

        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text
            style={[styles.heroHeading, isDark ? styles.heroHeadingDark : styles.heroHeadingLight]}
          >
            Hello, Student!
          </Text>
          <Text
            style={[styles.heroSubtitle, isDark ? styles.heroSubtitleDark : styles.heroSubtitleLight]}
          >
            Did you lose or find something today?
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.9} style={styles.actionButton}>
            <View style={styles.actionCircle}>
              <MaterialIcons name="search" size={32} color={SURFACE_ICON_COLOR} />
            </View>
            <Text
              style={[styles.actionText, isDark ? styles.actionTextDark : styles.actionTextLight]}
            >
              Report{"\n"}Lost Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionButton}
            onPress={() => router.push("/report-found")}
          >
            <View style={styles.actionCircle}>
              <MaterialIcons name="volunteer-activism" size={32} color={SURFACE_ICON_COLOR} />
            </View>
            <Text
              style={[styles.actionText, isDark ? styles.actionTextDark : styles.actionTextLight]}
            >
              Report{"\n"}Found Item
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.filtersContainer]}
          style={styles.filtersSection}
        >
          {FILTERS.map((filter) => {
            const isActive = filter === activeFilter;
            const palette = FILTER_COLORS[filter];
            const activeBackground = palette
              ? isDark
                ? palette.darkBg
                : palette.lightBg
              : null;
            const activeTextColor = palette
              ? isDark
                ? palette.darkText
                : palette.lightText
              : null;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  isDark ? styles.filterChipDark : null,
                  isActive && activeBackground
                    ? {
                        backgroundColor: activeBackground,
                        borderColor: "transparent",
                      }
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isDark ? styles.filterLabelDark : null,
                    isActive && activeTextColor
                      ? { color: activeTextColor }
                      : null,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, isDark ? styles.sectionTitleDark : styles.sectionTitleLight]}
          >
            Recent Posts
          </Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postsGrid}>
          {filteredPosts.map((post) => {
            const isFound = post.status === "Found";
            return (
              <TouchableOpacity
                key={post.id}
                activeOpacity={0.92}
                style={[styles.postCard, isDark ? styles.postCardDark : null]}
              >
                <View style={styles.postImageWrapper}>
                  <Image source={{ uri: post.image }} style={{ width: "100%", height: "100%" }} />
                  <View
                    style={[
                      styles.statusPill,
                      isFound ? styles.statusFound : styles.statusLost,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusLabel,
                        isFound ? styles.statusLabelLight : styles.statusLabelDark,
                      ]}
                    >
                      {post.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[styles.postTitle, isDark ? styles.postTitleDark : styles.postTitleLight]}
                  numberOfLines={1}
                >
                  {post.title}
                </Text>

                <View style={styles.postMetaRow}>
                  <MaterialIcons
                    name="location-on"
                    size={16}
                    color={mutedTextColor}
                  />
                  <Text
                    style={[styles.postMetaText, isDark ? styles.postMetaDark : styles.postMetaLight]}
                    numberOfLines={1}
                  >
                    {post.location}
                  </Text>
                </View>

                <View style={styles.postFooter}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Image source={{ uri: post.avatar }} style={{ width: "100%", height: "100%" }} />
                    </View>
                    <Text
                      style={[
                        styles.avatarLabel,
                        isDark ? styles.avatarLabelDark : null,
                      ]}
                    >
                      {post.author}
                    </Text>
                  </View>
                  <Text
                    style={[styles.timeLabel, isDark ? styles.timeLabelDark : null]}
                  >
                    {post.timeAgo}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomNav,
          isDark ? styles.bottomNavDark : styles.bottomNavLight,
        ]}
      >
        <View style={styles.navItems}>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons name="home" size={26} color={PRIMARY_COLOR} />
            <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.85}>
            <MaterialIcons
              name="fact-check"
              size={26}
              color={mutedTextColor}
            />
            <Text
              style={[
                styles.navLabel,
                isDark ? styles.navLabelInactiveDark : styles.navLabelInactive,
              ]}
            >
              Resolved
              {"\n"}Items
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            activeOpacity={0.85}
            onPress={() => router.push("/profile")}
          >
            <MaterialIcons
              name="person"
              size={26}
              color={mutedTextColor}
            />
            <Text
              style={[
                styles.navLabel,
                isDark ? styles.navLabelInactiveDark : styles.navLabelInactive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
