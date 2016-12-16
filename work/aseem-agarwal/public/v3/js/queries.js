var es_queries = {
  "conflict_country" : {
      "size" : 0,
      "query": {
        "bool": {
          "must": [
            {"terms": {
              "clarity": [
                1,2
              ]
            }}
          ]
        }
      },
      "aggs": {
        "country_inq": {
          "terms": {
            "field": "ccd",
            "size": 1000,
            "order" : { "sum_v" : "desc" }
          },
          "aggs" : {
            "sum_v" : { "sum" : { "field" : "high_est"}}
          }
        }
      }
  },
  "conflict_country_yr" : {
      "size" : 0,
      "query": {
        "bool": {
          "must": [
            {"term": {
              "ccd": {
                "value": "RWA"
              }
            }},
            {
              "range": {
                "year": {
                  "gte": 1989,
                  "lte": 1999
                }
              }
            },
            {"terms": {
              "clarity": [
                1,2
              ]
            }}
          ]
        }
      },
      "aggs": {
        "by_year": {
          "terms": {
            "field": "year",
            "size": 1000,
            "order": {
              "_term": "asc"
            }
          },
          "aggs": {
            "clarity": {
              "terms": {
                "field": "clarity",
                "size": 10
              },
              "aggs" : {
                "high" : { "sum" : { "field" : "high_est"}},
                "best" : { "sum" : { "field" : "best_est"}}
              }
            }
          }  
        }
      }
  },
  "all_conflicts_of_a_country" : {
    "size" : 10000,
    "query": {
      "bool": {
        "must": [
          {"term": {
            "ccd": {
              "value": "SDN"
            }
          }},
          {
            "term" : {
              "year" : {
                "value" : 1991
              }
            }
          }
        ]
      }
    }
  },
  "indicator" : {
    "ineq" :{ 
      "index" : "ineq",
      "type" : "ineq_country_year",
      "color" : "#000000",
      "q" : {
        "percentile" : {
          "size": 0,
          "query": {
           "match_all": {}
          },
          "aggs": {
            "perc": {
              "percentiles": {
                "field": "value",
                "percents": [
                  20,
                  80
                ]
              }
            }
          }
        },
        "country" : {
          "sort": [
            {
              "yr": {
                "order": "asc"
              }
            }
          ], 
          "size" : 1000,
          "query": {
            "bool": {
              "must": [
                {"terms": {
                  "ccode": ["KEN"]
                }},
                {"range": {
                  "yr": {
                    "gte": 1989
                  }
                }}  
              ]
            }
          }
        }
      }
    },
    "health" :{ 
      "index" : "health",
      "type" : "deaths",
      "color" : "#53A233",
      "q" : {
        "percentile" : {
          "size": 0,
          "query": {
           "match_all": {}
          },
          "aggs": {
            "perc": {
              "percentiles": {
                "field": "value",
                "percents": [
                  20,
                  80
                ]
              }
            }
          }
        },
        "country" : {
          "sort": [
            {
              "yr": {
                "order": "asc"
              }
            }
          ], 
          "size" : 1000,
          "query": {
            "bool": {
              "must": [
                {"terms": {
                  "ccode": ["KEN"]
                }},
                {"range": {
                  "yr": {
                    "gte": 1989
                  }
                }}
              ]
            }
          }
        }
      }
    },
    "cr" : {
      "index" : "cr",
      "type" : "cr_country_year",
      "color" : "#C3242B",
      "q" : {
        "percentile" : {
          "size": 0,
          "query": {
           "match_all": {}
          },
          "aggs": {
            "perc": {
              "percentiles": {
                "field": "value",
                "percents": [
                  20,
                  80
                ]
              }
            }
          }
        },
        "country" : {
          "sort": [
            {
              "yr": {
                "order": "asc"
              }
            }
          ], 
          "size" : 1000,
          "query": {
            "bool": {
              "must": [
                {"terms": {
                  "ccode": ["KEN"]
                }},
                {"range": {
                  "yr": {
                    "gte": 1989
                  }
                }}
              ]
            }
          }
        }
      }
    },
     "gdp" : {
      "index" : "gdp",
      "type" : "gdp_c",
      "color" : "#9F1F46",
      "q" : {
        "percentile" : {
          "size": 0,
          "query": {
           "match_all": {}
          },
          "aggs": {
            "perc": {
              "percentiles": {
                "field": "value",
                "percents": [
                  20,
                  80
                ]
              }
            }
          }
        },
        "country" : {
          "sort": [
            {
              "yr": {
                "order": "asc"
              }
            }
          ], 
          "size" : 1000,
          "query": {
            "bool": {
              "must": [
                {"terms": {
                  "ccode": ["KEN"]
                }},
                {"range": {
                  "yr": {
                    "gte": 1989
                  }
                }}
              ]
            }
          }
        }
      }
    }
  }
}
