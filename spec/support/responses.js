jasmine.getJSONFixtures().fixturesPath = 'spec/fixtures/json';

window.JsonApiResponses = {
  Question: {
    all: {
      success: {
        status: 200,
        response: getJSONFixture('questions/collection.json')
      }
    }
  },
  GiftCard: {
    find: {
      success: {
        status: 200,
        response: getJSONFixture('gift_cards/singular.json')
      },
      includes: {
        status: 200,
        response: getJSONFixture('gift_cards/includes.json')
      }
    },
    save: {
      success: {
        status: 200,
        response: getJSONFixture('gift_cards/singular.json')
      },
      failure: {
        status: 422,
        response: getJSONFixture('gift_cards/422_resource_invalid.json')
      }
    }
  },
  Order: {
    all: {
      success: {
        status: 200,
        response: getJSONFixture('orders/collection.json')
      },
      includes: {
        status: 200,
        response: getJSONFixture('orders/collection_includes.json')
      }
    },
    find: {
      success: {
        status: 200,
        response: getJSONFixture('orders/singular.json')
      },
      includes: {
        status: 200,
        response: getJSONFixture('orders/includes.json')
      }
    },
    attendees: {
      status: 200,
      response: getJSONFixture('orders/attendees/missing.json')
    },
    no_attendees: {
      status: 200,
      response: getJSONFixture('orders/attendees/none.json')
    },
    information: {
      status: 200,
      response: getJSONFixture('orders/information.json')
    },
    price: {
      status: 200,
      response: getJSONFixture('orders/price.json')
    },
    save: {
      success: {
        status: 200,
        response: getJSONFixture('orders/singular.json')
      },
      failure: {
        status: 422,
        response: getJSONFixture('orders/422_resource_invalid.json')
      }
    }
  },
  Product: {
    all: {
      success: {
        status: 200,
        response: getJSONFixture('products/collection.json')
      },
      paginated: {
        status: 200,
        response: getJSONFixture('products/paginated.json')
      }
    },
    find: {
      success: {
        status: 200,
        response: getJSONFixture('products/singular.json')
      },
      includes: {
        status: 200,
        response: getJSONFixture('products/includes.json')
      },
      failure: {
        status: 404,
        response: getJSONFixture('products/404_resource_not_found.json')
      }
    },
    save: {
      success: {
        status: 200,
        response: getJSONFixture('products/another_singular.json')
      },
      failure: {
        status: 422,
        response: getJSONFixture('products/422_resource_invalid.json')
      }
    },
    destroy: {
      success: {
        status: 204
      },
      failure: {
        status: 403,
        response: getJSONFixture('products/403_forbidden.json')
      }
    },
    attendees: {
      status: 200,
      response: getJSONFixture('products/attendees.json')
    },
    calendar: {
      status: 200,
      response: getJSONFixture('products/calendar.json')
    },
  },
  TimeSlot: {
    calendar: [
      {
        status: 200,
        response: getJSONFixture('time_slots/week1.json')
      },
      {
        status: 200,
        response: getJSONFixture('time_slots/week2.json')
      },
      {
        status: 200,
        response: getJSONFixture('time_slots/week3.json')
      },
      {
        status: 200,
        response: getJSONFixture('time_slots/week4.json')
      },
      {
        status: 200,
        response: getJSONFixture('time_slots/week5.json')
      },
    ],
    index: {
      status: 200,
      response: getJSONFixture('time_slots/index.json')
    }
  },
  Venue: {
    find: {
      tokenized: {
        status: 200,
        response: getJSONFixture('venues/singular_token.json')
      }
    }
  },
  relationships: {
    update: {
      success: {
        status: 204
      },
      failure: {
        status: 403
      }
    }
  }
};
