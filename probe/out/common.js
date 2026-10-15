function ShowMenu(){
  $('#header aside').css({ 'display' : 'block' });
  $('#header nav').css({ 'display' : 'block' });
  $('#topmenu nav').css({ 'display' : 'block' });
  $('.mobile_close').css({ 'display' : 'block' });
  $('.mobile_menu').css({ 'display' : 'none' });
}
function HideMenu(){
  $('#header aside').css({ 'display': 'none' });
  $('#header nav').css({ 'display': 'none' });
  $('.mobile_close').css({ 'display' : 'none' });
  $('.mobile_menu').css({ 'display' : 'block' });
}
// 금액 콤마표기
function monyReg(x) {
	return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 콤마제거
function undoComma(x) {
	return String(x).replace(/,/g, "");
}

// 인쇄하기
$(document).ready(function(){
  $('.print').click(function() {
    var result = confirm('해당페이지를 출력 하시겠습니까?');
    if(result) {
      //yes
      window.print();
    } else {
      //no
    }
  });
});

function logmes(mes){
	$.ajax({
		type: 'post',
		url: '/logmessage.ajax',
		data: {"mes":mes},
		dataType: 'json',
		beforeSend:function(){
			$('.wrap-loading').removeClass('display-none');
		},
		success : function(data, status, xhr) {
			$('.wrap-loading').addClass('display-none');
			console.log(data);
		},
		error : function(xhr, status, error) {
			console.log('error : ' + error);
		}
	});
	return true;
}
  

// $(function()
// {
//   // 메인 비쥬얼
//   $('.main_slide').each(function(index)
//   {
//     var self = $(this),
//         list = self.find('.list');
//
//     list.slick({
//       dots : true,
//       infinite : true,
//       speed : 300,
//       slidesToShow : 1,
//       arrows : true,
//       autoplay : true,
//       autoplaySpeed : 5000,
//       pauseOnFocus : false
//     });
//
//     var length = 0;
//     list.find('.slick-slide').each(function(idx)
//     {
//       var self = $(this);
//       if(!self.hasClass('slick-cloned')) length++;
//     });
//
//     list.find('.slick-dots button').each(function(idx)
//     {
//       var self = $(this),
//           text = self.text();
//
//       self.text(text +'/'+ length);
//     });
//     $('<button type="button" class="play_stop play" title="중지">■</button>').insertBefore(list.find('>*').eq(0));
//
//     list.find('.play_stop').click(function(e)
//     {
//       var self = $(this);
//       if(self.hasClass('play'))
//       {
//         self.removeClass('play').addClass('stop').text('▶').attr('title', '시작');
//         list.slick('slickPause');
//       }
//       else
//       {
//         self.removeClass('stop').addClass('play').text('■').attr('title', '중지');
//         list.slick('slickPlay');
//       }
//     });
//     if(length <= 1)
//     {
//       list.slick('slickPause');
//       list.find('.slick-dots').hide();
//     }
//   });
// });

// 웹 접근성 메인메뉴 탭 이동
$( function() {
  $(".tab_menu > li").bind("mouseenter focusin", function() {
    $(this).addClass("tab").siblings().removeClass("tab");
  });
  $(".tab_menu > li").bind("mouseleave focusout", function() {
    $(this).removeClass("tab");
  });
});

// 웹 접근성 로케이션 탭 이동
$( function() {
  $(".menu_path ul").bind("mouseenter focusin", function() {
    $(this).addClass("show").siblings().removeClass("show");
  });
  $(".menu_path ul").bind("mouseleave focusout", function() {
    $(this).removeClass("show");
  });
});

// 모바일 메인메뉴
$( function() {
  var mql = window.matchMedia("screen and (max-width: 1200px)");

  if (mql.matches) {
    $('.first_link').click(function(){
      return false;
    });
  } else {
    //console.log("화면의 너비가 1200px 보다 큽니다.");
  }
});

// 로케이션 클래스 추가, 링크막기
$( function() {
  $('.menu_path ul li:first-child a').addClass('first_link');
  $('.menu_path ul li .first_link').click(function(){
    return false;
  });
});


// layout
$( function() {
  $( "#dialog" ).dialog({
    autoOpen: false,
    modal: true,
    width:'auto',
    show: {
      effect: "fade",
      duration: 500
    },
    hide: {
      effect: "fade",
      duration: 500
    }
  });
  $( "#opener" ).on( "click", function() {
    $( "#dialog" ).dialog( "open" );
  });
});

// datepicker
$( function() {
  $( "#datepicker" ).datepicker({
    changeMonth: true,
    changeYear: true
  });
});

// datepicker - from, to
$( function() {
  var dateFormat = "yy-mm-dd",
      from = $( "#from" )
          .datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1
          })
          .on( "change", function() {
            to.datepicker( "option", "minDate", getDate( this ) );
          }),
      to = $( "#to" ).datepicker({
        defaultDate: "+1w",
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 1
      })
          .on( "change", function() {
            from.datepicker( "option", "maxDate", getDate( this ) );
          });

  function getDate( element ) {
    var date;
    try {
      date = $.datepicker.parseDate( dateFormat, element.value );
    } catch( error ) {
      date = null;
    }

    return date;
  }
} );

//tabs
$( function() {
  $( "#tabs" ).tabs();
});

//accordion
$( function() {
  $( "#accordion" ).accordion({
    heightStyle: "content"
  });
});

function searchParam(key) {
  try{
  		return new URLSearchParams(location.search).get(key);
	}
	catch (e) {
  		return null;
	}
};