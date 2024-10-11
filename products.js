const productsPage = {
  states: {
    queryParams: new URL(document.location).searchParams,
    productElements: $("[uipaste-action=search-item]"),
    productsParentElement: $("[uipaste-action=search-item]").parent(),
  },
  methods: {
    getFilterQuery() {
      const entries = new URL(document.location).searchParams.entries();
      const result = {};
      for (const [key, value] of entries) {
        // each 'entry' is a [key, value] tupple
        if (value) {
          const arrayValue = value.split(",").filter((item) => !!item) || [];
          result[key] = arrayValue.length > 1 ? arrayValue : arrayValue[0];
        }
      }
      return result;
    },
    getSelectedTools() {
      const selectedTools = productsPage.states.queryParams.get("tools");
      return (
        selectedTools
          ?.split(",")
          .map((item) => item.toLowerCase())
          .filter((item) => !!item) || []
      );
    },
    getSelectedTypes() {
      const selectedTypes = productsPage.states.queryParams.get("types");
      return (
        selectedTypes
          ?.split(",")
          .map((item) => item.toLowerCase())
          .filter((item) => !!item) || []
      );
    },
    implementFilter() {
      const search = productsPage.states.queryParams.get("search");
      const selectedTools = productsPage.methods.getSelectedTools();
      const result = [];
      const filteredProducts = productsPage.states.productElements.filter(
        function () {
          let isSelected = true;
          for (const [filterBy, filterValue] of Object.entries(
            productsPage.methods.getFilterQuery()
          )) {
            const target = $(this).find(`[uipaste-search-target=${filterBy}]`);
            if (target) {
              const targetValues = target
                .map(function () {
                  return $(this).text().toLowerCase();
                })
                .toArray();
              if (targetValues) {
                if (Array.isArray(filterValue)) {
                  isSelected &&= filterValue.reduce(
                    (res, v) => res && targetValues.includes(v),
                    true
                  );
                } else {
                  if (targetValues.length > 1) {
                    isSelected &&= targetValues.includes(filterValue);
                  } else {
                    isSelected &&= targetValues.reduce(
                      (res, v) => res && v.includes(filterValue),
                      true
                    );
                  }
                }
              }
            }
          }
          return isSelected;
        }
      );
      $("[uipaste-action=search-item]").remove();
      productsPage.states.productsParentElement.append(filteredProducts);
    },
    setupForm() {
      $("[uipaste-action=search-form]").submit(function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const url = new URL(document.location);
        url.searchParams.set("search", formData.get("search"));

        window.location.href = url;
      });
    },
    initialAllSearchFields() {
      $("[uipaste-search-field=search]").val(
        productsPage.states.queryParams.get("search")
      );
      $("[uipaste-search-field=tools]").each(function () {
        const selectedTools = productsPage.methods.getSelectedTools();
        if (
          selectedTools.includes(
            $(this).attr("uipaste-search-value").toLowerCase()
          )
        ) {
          $(this).addClass("button-filter-active");
        } else {
          $(this).removeClass("button-filter-active");
        }
      });
      $("[uipaste-search-field=types]").each(function () {
        const selectedTypes = productsPage.methods.getSelectedTypes();
        if (
          selectedTypes.includes(
            $(this).attr("uipaste-search-value").toLowerCase()
          )
        ) {
          $(this).addClass("button-filter-active");
        } else {
          $(this).removeClass("button-filter-active");
        }
      });
    },
    addListenerToFilterButtons() {
      $("[uipaste-search-field=tools]").click(function () {
        const url = new URL(document.location);
        const selectedTools = productsPage.methods.getSelectedTools();
        const clickingTool = $(this).attr("uipaste-search-value").toLowerCase();
        if (selectedTools.includes(clickingTool)) {
          const newSelectedTools = selectedTools.filter(
            (tool) => tool != clickingTool
          );
          url.searchParams.set("tools", newSelectedTools.join(","));
        } else {
          const newSelectedTools = selectedTools.concat([clickingTool]);
          url.searchParams.set("tools", newSelectedTools.join(","));
        }
        window.location.href = url;
      });
      $("[uipaste-search-field=types]").click(function () {
        const url = new URL(document.location);
        const selectedTypes = productsPage.methods.getSelectedTypes();
        const clickingTool = $(this).attr("uipaste-search-value").toLowerCase();
        if (selectedTypes.includes(clickingTool)) {
          const newSelectedTypes = selectedTypes.filter(
            (item) => item != clickingTool
          );
          url.searchParams.set("types", newSelectedTypes.join(","));
        } else {
          const newSelectedTypes = selectedTypes.concat([clickingTool]);
          url.searchParams.set("types", newSelectedTypes.join(","));
        }
        window.location.href = url;
      });
    },
  },
};

productsPage.methods.implementFilter();
productsPage.methods.setupForm();
productsPage.methods.initialAllSearchFields();
productsPage.methods.addListenerToFilterButtons();
