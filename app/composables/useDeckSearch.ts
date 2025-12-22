import type { SelectMenuItem } from '@nuxt/ui';
import { deckFilterItems } from '~/utils/constants';
import { QueryOrder } from '~/utils/enums';

export const useDeckSearch = (baseMode: 'history' = 'history') => {
  const route = useRoute();

  const defaults: DeckUrlParams = {
    page: '1',
    limit: '10',
    filter: 'recently',
    search: '',
  } as const;

  const urlParams = useUrlSearchParams<Partial<DeckUrlParams>>(baseMode, {
    initialValue: route.query,
  });

  const filterItems = ref<SelectMenuItem[]>(deckFilterItems);

  const page = computed({
    get: () => Number(urlParams.page || defaults.page),
    set: (val) => {
      urlParams.page = val === +defaults.page ? undefined : String(val);
    },
  });

  const limit = computed({
    get: () => String(urlParams.limit || defaults.limit),
    set: (val) => {
      urlParams.limit = val === defaults.limit ? undefined : val;
      urlParams.page = undefined;
    },
  });

  const filter = computed({
    get: () => urlParams.filter || defaults.filter,
    set: (val) => {
      urlParams.filter = val === defaults.filter ? undefined : val;
      urlParams.page = undefined;
    },
  });

  const search = ref(urlParams.search || defaults.search);
  const debouncedSearch = refDebounced(search, 300);

  watch(debouncedSearch, (newSearch) => {
    urlParams.search = newSearch === defaults.search ? undefined : newSearch;
    urlParams.page = undefined;
  });

  const query = computed(() => {
    let orderBy: DeckOrderBy = 'openedAt';
    let order: QueryOrder = QueryOrder.DESC_NULLS_LAST;

    switch (filter.value) {
      case 'recently':
        orderBy = 'openedAt';
        order = QueryOrder.DESC_NULLS_LAST;
        break;
      case 'newest':
        orderBy = 'createdAt';
        order = QueryOrder.DESC_NULLS_LAST;
        break;
      case 'oldest':
        orderBy = 'createdAt';
        order = QueryOrder.ASC_NULLS_LAST;
        break;
      case 'name_az':
        orderBy = 'name';
        order = QueryOrder.ASC_NULLS_LAST;
        break;
      case 'name_za':
        orderBy = 'name';
        order = QueryOrder.DESC_NULLS_LAST;
        break;
    }

    return {
      page: page.value,
      limit: limit.value,
      search: debouncedSearch.value,
      orderBy,
      order,
    };
  });

  return {
    page,
    limit,
    filter,
    search,
    filterItems,
    query,
    defaults,
  };
};
