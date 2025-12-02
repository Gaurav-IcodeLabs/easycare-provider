import {
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useEffect} from 'react';
import {ScreenHeader} from '../../components/ScreenHeader/ScreenHeader';
import {scale, width} from '../../utils';
import {colors, ListingType, SCREENS} from '../../constants';
import {GradientWrapper, AppText, ListingCard} from '../../components';
import {easycare, magnify, placeholder} from '../../assets';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../apptypes';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  fetchServices,
  fetchProducts,
  fetchListingsInProgressSelector,
  serviceIdsSelector,
  productIdsSelector,
} from '../../slices/home.slice';
import {getOwnListingsById} from '../../slices/marketplaceData.slice';

type HomeNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  typeof SCREENS.HOME
>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const dispatch = useAppDispatch();
  const entities = useTypedSelector(state => state.marketplaceData.entities);
  const servicesIds = useTypedSelector(serviceIdsSelector);
  const productsIds = useTypedSelector(productIdsSelector);
  const services = getOwnListingsById(entities, servicesIds);
  const products = getOwnListingsById(entities, productsIds);

  const isLoading = useTypedSelector(fetchListingsInProgressSelector);

  useEffect(() => {
    loadAllListings();
  }, []);

  const loadAllListings = () => {
    dispatch(fetchServices());
    dispatch(fetchProducts());
  };

  const handleProfilePress = () => {
    navigation.navigate(SCREENS.PROFILE);
  };

  const handleListingPress = (listing: any) => {
    const listingType = listing?.attributes?.publicData?.listingType;
    const listingId = listing?.id?.uuid;

    if (listingType === ListingType.SERVICE) {
      navigation.navigate(SCREENS.CREATE_SERVICE, {listingId});
    } else if (listingType === ListingType.PRODUCT) {
      navigation.navigate(SCREENS.CREATE_PRODUCT, {
        listingId,
      });
    }
  };

  const renderListingItem = ({item}: any) => {
    return (
      <ListingCard
        listing={item}
        containerStyle={styles.listingCard}
        onPress={() => handleListingPress(item)}
      />
    );
  };

  const renderSection = (title: string, data: any[]) => {
    if (data.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>{title}</AppText>
        <FlatList
          data={data}
          renderItem={renderListingItem}
          keyExtractor={item => item.id.uuid}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  return (
    <GradientWrapper>
      <ScreenHeader
        containerStyle={{paddingHorizontal: scale(20)}}
        renderLeft={() => (
          <TouchableOpacity onPress={handleProfilePress}>
            <Image source={placeholder} style={styles.left} />
          </TouchableOpacity>
        )}
        renderCenter={() => <Image source={easycare} resizeMode="contain" />}
        renderRight={() => (
          <TouchableOpacity>
            <Image source={magnify} style={styles.right} />
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.deepBlue} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          {renderSection('Services', services)}
          {renderSection('Products', products)}

          {services.length === 0 && products.length === 0 && (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No listings found</AppText>
            </View>
          )}
        </ScrollView>
      )}
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  outercontainer: {
    flex: 1,
    backgroundColor: colors.milkWhite,
  },
  topsection: {
    width: width,
    justifyContent: 'flex-start',
  },
  headerContainer: {
    // paddingTop: topInset,
    justifyContent: 'flex-start',
    paddingBottom: scale(80),
  },
  right: {
    width: scale(40),
    height: scale(40),
    padding: scale(8),
    backgroundColor: '#417ABD',
    borderRadius: scale(10),
  },
  left: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
  },
  headerImgContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    justifyContent: 'space-between',
    marginTop: scale(10),
  },
  discountImg: {
    width: scale(135),
    height: scale(123),
  },
  carwashImg: {
    width: scale(170),
    height: scale(125),
  },
  scrollContainer: {
    paddingBottom: scale(20),
  },
  section: {
    marginTop: scale(20),
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: '600',
    color: colors.deepBlue,
    paddingHorizontal: scale(20),
    marginBottom: scale(15),
  },
  horizontalList: {
    paddingHorizontal: scale(20),
    gap: scale(15),
  },
  listingCard: {
    width: scale(280),
    marginRight: scale(15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(50),
  },
  emptyText: {
    fontSize: scale(16),
    color: colors.neutralDark,
  },
});
