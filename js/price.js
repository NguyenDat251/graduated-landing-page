let slider = document.getElementById("InputAmountUser");
let output = document.getElementById("AmountUser");
let outputSecond = document.getElementById("AmountUserSecond");
output.innerHTML = slider.value;
outputSecond.innerHTML = slider.value;

let count = 1;
let featureList, comboList;
let featureChoosenList = [];
let FeaturesListEl = document.getElementById("features-list");
let FeaturesPriceEl = document.getElementById("features-price")
let ComboListEl = document.getElementById("price-bundle");

let choosenCombo;
let isCombo = false;


function sortByPrice(list) {
  const sortedList = [...list];
  sortedList.sort((a, b) => a.unitPrice - b.unitPrice);

  return sortedList;
}

function setUpFeature(data) {
  featureList = data.featureList,
    comboList = data.comboList;

  featureList = [...sortByPrice(featureList)];

  featureList.forEach(el => {
    if (!el.unitPrice) {
      featureChoosenList.push(el);
    }

    let html =
      '<li>\
        <div id="SingleFeature" class="featureWrapper" onclick="selectFeature(event, \'' + el.featureName + '\')"> \
          <span class="feature-select">';
    if (!el.unitPrice) {
      html += '<i class="fa fa-check-circle fa-lg default-check" aria-hidden="true"></i>'
    } else {
      html += '<i class="far fa-circle fa-lg"></i>'
    }


    html += '<b>' + el.featureName + '</b> \
                                </span> \
                                <span>' + formatNumber(el.unitPrice)
    if (el.featureName === 'Tuyển dụng')
      html += ' đ/tháng</span> '
    else
      html += ' đ/người/tháng</span>'
    html += '</div> \
                        </li>'

    FeaturesListEl.innerHTML += html
  })

  updatePrice()

  slider.oninput = function () {
    outputSecond.innerHTML = slider.value;
    output.innerHTML = slider.value;

    updatePrice()
  }


  TabActiveFirst = document.getElementById('price-bundle')
  TabActiveFirst.className = TabActiveFirst.className.replace(" tab-content-hidden", "");
}

const getFeatures = async () => {
  await axios.get('http://167.179.80.90:8761/api/gateway/public/features', ).then(function (response) {
      setUpFeature(response.data.data);
      setUpBundle(response.data.data);
    })
    .catch(function (error) {
      console.log("error: ", error);
    });
}

function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function updatePrice() {
  let PriceTotal = document.getElementById("TotalPrice")
  let PerMonth = document.getElementById("Per-month")

  FeaturesPriceEl.innerHTML = '';
  let total = 0;
  featureChoosenList.forEach(el => {
    let price = 0;

    let html_price = '<li>\
                            <div ><span>';

    html_price += el.featureName + ' \
                                </span><span>'

    if (el.featureName === 'Tuyển dụng') {
      price = el.unitPrice * 12
    } else {
      price = el.unitPrice * slider.value * 12

    }
    total += price;
    html_price += formatNumber(price)
    html_price += ' đ</span></div></li>'

    FeaturesPriceEl.innerHTML += html_price

  })

  PriceTotal.innerHTML = formatNumber(total);
  PerMonth.innerHTML = formatNumber(Math.round((total) / 12));
}

function selectFeature(e, feature) {

  if (e.currentTarget.innerHTML.indexOf("fa-check-circle") !== -1) {
    e.currentTarget.innerHTML = e.currentTarget.innerHTML.replace("fa fa-check-circle check", "far fa-circle")
    const indexRemoveFeature = featureChoosenList.findIndex(el => el.featureName === feature);
    featureChoosenList.splice(indexRemoveFeature, 1);
  } else {
    e.currentTarget.innerHTML = e.currentTarget.innerHTML.replace("far fa-circle", "fa fa-check-circle check")
    featureChoosenList.push(featureList.find(el => el.featureName === feature))
  }

  updatePrice();
}

function onClickBtnPrice(e, type) {
  var current = document.getElementsByClassName("active-price-bundle");
  current[0].className = current[0].className.replace(" active-price-bundle", "");
  e.currentTarget.className += " active-price-bundle";

  let TabActive = document.getElementById(type);
  TabActive.className = TabActive.className.replace(" tab-content-hidden", "");

  if (type === 'price-bundle') {
    let TabHidden = document.getElementById('price-custom');
    TabHidden.className += " tab-content-hidden";
  } else {
    let TabHidden = document.getElementById('price-bundle');
    TabHidden.className += " tab-content-hidden";
  }
}

function clickBundle(event) {
  let bundles = document.getElementsByClassName("single-price-plan");

  let i;
  for (i = 0; i < bundles.length; i++) {
    bundles[i].className = bundles[i].className.replace(" active", "");
  }

  event.currentTarget.className += " active"
}

function getListFeatureBundle(comboDetail) {
  let html = `<p>Dành cho ` + comboDetail.EMPLOYEE_MANAGE + ` người </p>`;

  const listKey = Object.keys(comboDetail);
  const len = listKey.length;

  for(let i = 1; i < len; i++) {
    console.log("key: ", listKey[i]);
    console.log("featureList: ", featureList);
    html += `<p>` + featureList.find(el => el.featureId == [listKey[i]]).featureName + `</p>`;
  }

  return html;
}

function buyCombo(comboId) {
  choosenCombo = {...comboList.find(el => el.comboId === comboId)};
  isCombo = true;

  $('#comboName').html(choosenCombo.comboName);
  $('#totalPrice').html(formatNumber(choosenCombo.totalPrice));
}

function buyFeatures() {
  isCombo = false;
  $('#comboName').html('tính năng lẻ');
  $('#totalPrice').html($('#TotalPrice').html());
}

function getChoosenFeaturesObject() {
  let result = {'EMPLOYEE_MANAGE': slider.value};

  featureChoosenList.forEach(el => {
    result[el] = true;
  })

  return result;
}

function sendRequest() {
  console.log("isCombo: ", isCombo);
  console.log("comboId: ", choosenCombo.comboId);
  console.log("companyId: ",$("#companyCode").val());
  console.log("email: ",  $("#emailBuyer").val());
  console.log("requestedFeatures: ", getChoosenFeaturesObject());


  axios.post('http://167.179.80.90:8761/api/admin/public/requestfeature', {
    "comboId": isCombo ? choosenCombo.comboId : '',
  "companyId": $("#companyCode").val(),
  "email": $("#emailBuyer").val(),
  "firstPay": true,
  "orderId": "string",
  "requestedFeatures":isCombo ? {} : getChoosenFeaturesObject()
  }).then(response => {
    // if(response.data.returnCode != 1) {
    //   alert(response.data.returnMessage);
    //   return;
    // }

    alert(response.data.returnMessage);
  }).catch(error => {
    console.log(error.response);
  })

  if(isCombo) {

  }
}

function setUpBundle(data) {
  comboList = data.comboList;

  comboList.forEach(el => {
    const html = `<div class="col-12 col-md-6 col-lg-3">
          <!-- Package Price  -->
          <div class="single-price-plan text-center" onclick="clickBundle(event)">
            <!-- Package Text  -->
            <div class="package-plan">
              <h5>` + el.comboName + `</h5>
              <div class="ca-price d-flex justify-content-center">
                <h4>` + formatNumber(el.totalPrice) + `</h4>
                <span>đ</span>
              </div>
            </div>
            <div class="package-description">`
             + getListFeatureBundle(el.comboDetail) + 
              `<a href="#" class="loadMore">Xem thêm</a>
            </div>
            <!-- Plan Button  -->
            <div class="plan-button" onclick="buyCombo(\'` + el.comboId + `\')"  data-toggle="modal" data-target="#myModal">
              <a >Chọn</a>
            </div>
          </div>
        </div>`

        ComboListEl.innerHTML += html
  })

  for (let i = 0; i < 4; i++) {
    const currentEl = $(".single-price-plan").get(i);
    console.log("currentEl: ", currentEl);
    const arrPara = $(currentEl).find("p");
    arrPara.slice(0, 4).show();

    const btnMore = $(currentEl).find(".loadMore")
    btnMore.on('click', function (e) {
      e.preventDefault();
      if ($(currentEl).find("p:hidden").length === 0) {
        $(currentEl).find("p").slice(4, $(currentEl).find("p").length).slideUp();

        btnMore.html('Xem thêm');
        return;
      }
      $(currentEl).find("p:hidden").slice(0, $(currentEl).find("p:hidden").length).slideDown();
      if ($(currentEl).find("p:hidden").length === 0) {
        btnMore.html('Thu gọn');
      }
    });

  }
}

// $(function () {
//   //$("#bundle-1 p").slice(0, 4).show();
//   for (let i = 0; i < 4; i++) {
//     const currentEl = $(".single-price-plan").get(i);
//     console.log("currentEl: ", currentEl);
//     const arrPara = $(currentEl).find("p");
//     arrPara.slice(0, 4).show();

//     const btnMore = $(currentEl).find(".loadMore")
//     btnMore.on('click', function (e) {
//       e.preventDefault();
//       if ($(currentEl).find("p:hidden").length === 0) {
//         $(currentEl).find("p").slice(4, $(currentEl).find("p").length).slideUp();

//         btnMore.html('Xem thêm');
//         return;
//       }
//       $(currentEl).find("p:hidden").slice(0, $(currentEl).find("p:hidden").length).slideDown();
//       if ($(currentEl).find("p:hidden").length === 0) {
//         btnMore.html('Thu gọn');
//       }
//     });

//   }
// });

getFeatures();
