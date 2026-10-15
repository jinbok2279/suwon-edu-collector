//var QUAL_RESULT = false; // 간편자격증명조회 조회여부
//var QUAL_RESULT = true; // 간편자격증명조회 조회여부 - 테스트모드

var hangkik_YN = 'N';

//성남 대기 접수 강제 모드 'Y' 적용 이후 'N'으로 변경
//var re_register_mode = 'Y'
var re_register_mode = 'N';

var check_register_mode = 'N'; //previous reg check
//var re_register_mode = 'N'

// 업장 : center
// 종목 : event
// 프로그램 : class

// FIELD
var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;
var date = today.getDate();
var hours = today.getHours();
var minutes = today.getMinutes();
var mem_nm_val ="";

var memInfo = {};

function searchParam(key) {
	try{
  		return new URLSearchParams(location.search).get(key);
	}
	catch (e) {
  		return null;
	}
};

$(document).ready(function (){
    NetFunnel_Action({action_id:'act_1'}, {
		success:function(ev,ret){
			upListAjax();       // 업장 리스트 셀렉트박스
			
			try{
				var param_up_id = searchParam('up_id');
				
				if (getCookie('t_upid') != '' && getCookie('t_upid') != 'undefined' && getCookie('t_upid') != undefined && getCookie('t_upid') != null) {
					$('#center').val(getCookie('t_upid')).prop("selected",true);
					setCookie('t_upid', '');
				} else if(param_up_id != null && param_up_id != 'undefined' && param_up_id != ''){
					$('#center').val(param_up_id).prop("selected",true);	
				}
			}
			catch (e) {
		  		
			}
			
		    var up_id = $("#center option:checked").val();
		
			if (up_id != "00") {
		    	itemlistAjax( up_id ); // 업장별 품목
			}
			if (getCookie('t_bascd') != '' && getCookie('t_bascd') != 'undefined' && getCookie('t_bascd') != undefined && getCookie('t_bascd') != null) {
				$('#event').val(getCookie('t_bascd')).prop("selected",true);
				setCookie('t_bascd', '');
			}
			
			if (up_id != "00") {
			    var bas_cd = $("#event option:checked").val();
			    pgmListAjax( up_id, bas_cd ); // 품목별 강좌
			}
		
		    targetListAjax( up_id );   // 대상 리스트 셀렉트 박스
			if (getCookie('t_targetcd') != '' && getCookie('t_targetcd') != 'undefined' && getCookie('t_targetcd') != undefined && getCookie('t_targetcd') != null) {
				$('#target').val(getCookie('t_targetcd')).prop("selected",true);
				setCookie('t_targetcd', '');
			}
		
			/*$.ajax({
		        type: 'post',
		        url: '/getRunMode.ajax',
		        dataType: 'text',
		        success : function(data, status, xhr) {
					if(data.includes('dev')){
		            	QUAL_RESULT = true;
					}
		        },
		        error : function(xhr, status, error) {
		            console.log('error : ' + error);
		        }
		    });
			*/
			
		    console.log("검색1 : ",getCookie('t_pgmnm'));
			if (getCookie('t_pgmnm') != '' && getCookie('t_pgmnm') != 'undefined' && getCookie('t_pgmnm') != undefined && getCookie('t_pgmnm') != null) {
				$('#pgm_nm').val(getCookie('t_pgmnm'));
		    	courseListAjax( 0 );
				setCookie('t_pgmnm', '');
			}
			
			$('#event').select2();
		},
        error:function(ev,ret){
		    //"네트워크 상태를 확인해주세요" 등의 메시지 처리
            //또는 아무런 처리도 하지 않도록, 지금 처럼 공백으로 유지
		}
	});
});
// 업장 리스트의 값 변동 일어 났을 때 종목 ajax 실행

$(document).on('change', '#center',function (){
    var up_id = $("#center option:checked").val();
    itemlistAjax( up_id );
	targetListAjax( up_id );
});

// 종목 리스트의 값 변동 일어 났을 때 프로그램 ajax 실행
$(document).on('change', '#event',function (){
    var up_id  = $("#center option:checked").val();
    var bas_cd = $("#event option:checked").val();
    pgmListAjax( up_id, bas_cd );
});

// 센터 목록
function upListAjax(){
    const param = {};

    $.ajax({
       type: 'post',
       url: '/upList.ajax',
       data: param,
       dataType: 'json',
       async:false,
       success : function(data, status, xhr) {
            // console.log(data);
           optionSet( data.data, 'center' );
       },
       error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("upListAjax error => " + error);
       }
    });
}

// 대분류 목록
function itemlistAjax( up_id ){

    var param = {};
    if( up_id != '' && up_id != undefined || up_id != null ){// 값이 있으면
        param.up_id = up_id;
    } else { // 값이 없으면
        param.up_id = $("#center option:selected").val();
    }

    $.ajax({
        type: 'post',
        url: '/itemList.ajax',
        data: param,
        dataType: 'json',
        async:false,
        success : function(data, status, xhr) {
            // console.log(data);
            optionSet( data.data, 'event' );
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("itemlistAjax error => " + error);
        }
    });
}

// 소분류 목록
function pgmListAjax( up_id, bas_cd ){
    var param = {};
    param.up_id = up_id;
    param.bas_cd = bas_cd;

    $.ajax({
        type: 'post',
        url: '/pgmList.ajax',
        data: param,
        dataType: 'json',
        async:false,
        success : function(data, status, xhr) {
            console.log(data);
            optionSet( data.data, 'class' );
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("pgmListAjax error => " + error);
        }
    });
}

// 대상 목록 리스팅
function targetListAjax( up_id ) {
    var param = {};
	param.up_id = up_id;
    param.ini_cd = '04';
	
    $.ajax({
        type: 'post',
        url: '/targetList.ajax',
	    data: param,
        dataType: 'json',
        success : function(data, status, xhr) {
            // console.log(data);
            optionSet( data.data, 'target' );
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("targetListAjax error => " + error);
        }
    });
}

// 셀렉트 박스 세팅 공통펑션
function optionSet( data, selectNm ){
    var selectComp = $("#" + selectNm );
    selectComp.empty();

    if( selectNm == 'center'){
        selectComp.append("<option value='00'>선택</option>");
    }
    if( selectNm == 'event'){
        selectComp.append("<option value='00'>선택</option>");
    }
    if( selectNm == 'class'){
        selectComp.append("<option value='00'>전체</option>");
    }
    if( selectNm == 'target'){
        selectComp.append("<option value='99'>전체</option>");
    }

    if( data != null && data.length > 0 ){
        for(var i = 0; i < data.length; i++){
            if( selectNm == 'class' ){
                selectComp
                    .append("<option value='" + data[i].item_cd + "'>" + data[i].item_nm + "</option>");
            } else if( selectNm == 'center' ){
                selectComp
                    .append("<option value='" + data[i].com_cd + "'>" + data[i].com_nm + "</option>");
            } else if( selectNm == 'event' ){
                selectComp
                    .append("<option value='" + data[i].com_cd + "'>" + data[i].com_nm + "</option>");
            } else if ( selectNm == 'target') {
                selectComp
                    .append("<option value='" + data[i].com_cd + "'>" + data[i].com_nm + "</option>");
            }
        }
    }
}

// 요일선택 펑션
$('.sub_contents .class_search .others .weeknames').each(function(index)
{
    var weeknames = $(this),
        input = weeknames.find('input'),
        label = weeknames.find('label');

    input.each(function(idx)
    {
        var self = $(this), // input checkbox
            id = self.attr('id'),
            self_label = weeknames.find('label[for="'+ id +'"]');

        if(self.is(':checked'))
            self_label.addClass('active');
        else
            self_label.removeClass('active');
    });

    input.bind('click change', function(e)
    {
        var self = $(this),
            id = self.attr('id'),
            self_label = weeknames.find('label[for="'+ id +'"]');

        if(self.is(':checked'))
        {
            input.prop('checked', false);
            label.removeClass('active');

            self.prop('checked', true);
            self_label.addClass('active');
        }
        else
        {
            input.prop('checked', false);
            label.removeClass('active');
        }
    });
    // 지워도 작용에 문제 없음 -> 클래스 매핑 안돼있음
    $('.proc_list .search form :reset').click(function(e)
    {
        input.prop('checked', false);
        label.removeClass('active');
    });
});

// 조회 버튼 클릭 이벤트 -> 조회실행
$("#submit").on('click', function (){
    courseListAjax1( 0 );
});

// 강습 조건 조회
function courseListAjax( pagenum ){

    var up_id    = $("#center option:checked").val(); 	//업장
    var bas_cd   = $("#event option:checked").val();  	//종목
    var item_cd  = $("#class option:checked").val();  	//프로그램
    var pgm_nm   = $("#pgm_nm").val();					//프로그램명
    var weekname = $("input:checkbox[name='weekname']:checked").val();	//선택된 요일
    var week_nm  = '';
	var ju_dc = $("#ju_dc").val();

    switch (weekname){
        case '1' : week_nm = '월'; break;
        case '2' : week_nm = '화'; break;
        case '3' : week_nm = '수'; break;
        case '4' : week_nm = '목'; break;
        case '5' : week_nm = '금'; break;
        case '6' : week_nm = '토'; break;
        case '7' : week_nm = '일'; break;
    }
    var target_cd = $("#target option:checked").val();	//교육대상 구분
    var coach_id  = $("#lerturer_name").val();			//강사명 현재 jsp주석처리되어있음(사용안하는걸로 보임)
	
	if ($("#center option:checked").val() == '00') {
		alert('체육센터를 선택해 주세요.');
		return false;
	}
	
	if ($("#event option:checked").val() == '00') {
		alert('대분류를 선택해 주세요.');
		return false;
	}
	
    var param = {};
    param.up_id     = up_id;
    param.bas_cd    = bas_cd;
    param.item_cd   = item_cd;
    param.pgm_nm    = pgm_nm;
    param.week_nm   = week_nm;
    param.target_cd = target_cd;
    param.coach_id  = coach_id;
	param.ju_dc = ju_dc;

    param.page = pagenum;
    param.perPageNum = 30;


    NetFunnel_Action({action_id:'act_4'}, {
		success:function(ev,ret){
		    $.ajax({
		        type: 'post',
		        url: '/courseListAjax.ajax',
		        data: param,
		        dataType: 'json',
		        beforeSend:function(){
		            $('.wrap-loading').removeClass('display-none');
		        },
		        success : function(data, status, xhr) {
		            $('.wrap-loading').addClass('display-none');
		            //console.log(data);
		            listSet(data);
					NetFunnel_Complete();
		        },
		        error : function(xhr, status, error) {
					$('.wrap-loading').addClass('display-none');
					console.log('error : ' + error);
					logmes("courseListAjax error => " + error);
					NetFunnel_Complete();
		        }
		    });
		},
        error:function(ev,ret){
		    //"네트워크 상태를 확인해주세요" 등의 메시지 처리
            //또는 아무런 처리도 하지 않도록, 지금 처럼 공백으로 유지
		}
	});
}

// 강습 조건 조회 - 버튼클릭만 분리
function courseListAjax1( pagenum ){

    var up_id    = $("#center option:checked").val(); 	//업장
    var bas_cd   = $("#event option:checked").val();  	//종목
    var item_cd  = $("#class option:checked").val();  	//프로그램
    var pgm_nm   = $("#pgm_nm").val();					//프로그램명
    var weekname = $("input:checkbox[name='weekname']:checked").val();	//선택된 요일
    var week_nm  = '';
	var ju_dc = $("#ju_dc").val();

    switch (weekname){
        case '1' : week_nm = '월'; break;
        case '2' : week_nm = '화'; break;
        case '3' : week_nm = '수'; break;
        case '4' : week_nm = '목'; break;
        case '5' : week_nm = '금'; break;
        case '6' : week_nm = '토'; break;
        case '7' : week_nm = '일'; break;
    }
    var target_cd = $("#target option:checked").val();	//교육대상 구분
//    var coach_id  = $("#lerturer_name").val();			//강사명 현재 jsp주석처리되어있음(사용안하는걸로 보임)
	
	if ($("#center option:checked").val() == '00') {
		alert('체육센터를 선택해 주세요.');
		return false;
	}
	
	if ($("#event option:checked").val() == '00') {
		alert('대분류를 선택해 주세요.');
		return false;
	}
	
    var param = {};
    param.up_id     = up_id;
    param.bas_cd    = bas_cd;
    param.item_cd   = item_cd;
    param.pgm_nm    = pgm_nm;
    param.week_nm   = week_nm;
    param.target_cd = target_cd;		
//    param.coach_id  = coach_id;
	param.ju_dc = ju_dc;
    param.page = pagenum;
    param.perPageNum = 30;


    NetFunnel_Action({action_id:'act_2'}, {
		success:function(ev,ret){
		    $.ajax({
		        type: 'post',
		        url: '/courseListAjax.ajax',
		        data: param,
		        dataType: 'json',
		        beforeSend:function(){
		            $('.wrap-loading').removeClass('display-none');
		        },
		        success : function(data, status, xhr) {
		            $('.wrap-loading').addClass('display-none');
		            //console.log(data);
		            listSet(data);
					NetFunnel_Complete();
		        },
		        error : function(xhr, status, error) {
					$('.wrap-loading').addClass('display-none');
					console.log('error : ' + error);
					logmes("courseListAjax error => " + error);
					NetFunnel_Complete();
		        }
		    });
		},
        error:function(ev,ret){
		    //"네트워크 상태를 확인해주세요" 등의 메시지 처리
            //또는 아무런 처리도 하지 않도록, 지금 처럼 공백으로 유지
		}
	});
}

function dateFormatter( data ){
    var year = data.substring(0,4);
    var month = data.substring(4,6);
    var day = data.substring(6,8);

    return year+"-"+month+"-"+day;
}

function timeFormatter( data ){
    var hour = data.substring(0,2);
    var min  = data.substring(2,4);
    return hour+":"+min;
}

function isBeforeReapply(reapplyStartDt) {
    if (!reapplyStartDt) return false;

    const todayDay = new Date().getDate();
    const reDay = Number(reapplyStartDt.substring(6, 8));

    return todayDay >= 8 && todayDay < reDay;
}

function isBlockedLesson(up_id, lesson_gu) {
    const todayDay = new Date().getDate();

    return up_id === '02'
        && lesson_gu === '03'
        && todayDay >= 1
        && todayDay <= 14;
}

// 강습 조회 결과 테이블 세팅
function listSet(incomeData) {
    var listData = incomeData.data
    var pageData = incomeData.pageMaker;

    var tbody = $(".table_list_info > tbody");
    tbody.empty();
    if (listData.resultCode == 'isnull') {
        $("#pagination").empty();
        tbody.append($('<tr>').append($('<td>', {
            text : listData.resultMessage
        }).attr("colspan", 12)));
    } else {
		var chk_test_id = false;  
		if ($("#logSession").val() == 'mpb1000'
			|| $("#logSession").val() == 'smilejudy'
			|| $("#logSession").val() == 'yenny9191'
			|| $("#logSession").val() == 'rkdwjdrntk'
			|| $("#logSession").val() == 'jjt0204'
			|| $("#logSession").val() == 'swimmonk'
			|| $("#logSession").val() == 'khpark'
            || $("#logSession").val() == 'kjhwang123')  // 금곡 요청으로 추가
			{
				chk_test_id = true;
			}
	
        for (var i = 0; i < listData.length; i++) {
            // 실결제 테스트
            // TEST : 금액이 있는 상품은 test1234 계정으로 접속했을 때만 보인다.
            // if ( Number(listData[i].u_price) > 0 && $("#logSession").val() != 'test1234' ) {
			//if ( listData[i].up_id == '01' && (listData[i].pgm_nm.indexOf('테스트') != -1 || listData[i].pgm_nm.indexOf('test') != -1)  && $("#logSession").val() != 'test1234') {
			if (listData[i].pgm_nm.indexOf('테스트') != -1 && !chk_test_id) {	
            //테스트 강좌 안보임
            } else {
				if (listData[i].pgm_group_cd == '' || listData[i].pgm_group_cd == 0) {
					listData[i].group_rgl_qty = listData[i].rgl_qty;
				}else{
					if(listData[i].group_rgl_qty == null || listData[i].group_rgl_qty == 'undefined' || listData[i].group_rgl_qty.length < 1) {
			            listData[i].group_rgl_qty = 0;
			        }	
				}
				//var now = Number(listData[i].group_regi_inwon) + Number(listData[i].paying_group_inwon);
				var now = Number(listData[i].group_regi_inwon) + Number(listData[i].cart_group_inwon);
                var total = Number(listData[i].group_rgl_qty);

				if (isBeforeReapply(listData[i].reapply_start_dt)) {
  				  now = total;
				}
				
				if (isBlockedLesson(listData[i].up_id, listData[i].lesson_gu)) {
  				  now = total;
				}
				
                var daegi = Number(listData[i].deagi_rgl_qty);
                var group_deagi = Number(listData[i].group_deagi_rgl_qty);
				var daegi_regi = Number(listData[i].deagi_regi_inwon);
                var able_regist_degi_cnt = 0 ;
				var up_id = listData[i].up_id;
				var ju_dc = $("#ju_dc").val();
				if(up_id=="02" || up_id=="03") {
					daegi_regi = Number(listData[i].deagi_judc_regi_inwon);
					if(ju_dc!='2') {
					able_regist_degi_cnt = Math.ceil(group_deagi * 0.7) - daegi_regi; 
				}else {
					able_regist_degi_cnt = Math.floor(group_deagi * 0.3) - daegi_regi; 
				}
					
				}else {
					able_regist_degi_cnt =  group_deagi - daegi_regi;
				}
							
				
			
				var aTag = ''; 

//              신청기간이 아닌 프로그램도 리스트 다 보이면서 DTETB로 버튼 옵션만 바꿀 때 주석해제
                if( listData[i].able_type == 'able' ){
					//var group_regi_count = Number(listData[i].group_regi_inwon) + Number(listData[i].paying_group_inwon)
                    
                    var real_dt = listData[i].real_st_dt;

                    if( real_dt == undefined || real_dt == '' || real_dt == null) {
                        real_dt = '0';
                    }
                	// 신규 접수기간중  신청은 다음달 기준임. 현재달 수강중이어도 다음달 수강중이 아니라면 신청 가능하게 변경. 2021.03.08
                    // 다음달 강좌가 없을 때만

					if(listData[i].reserved_gb != '01'){//대기접수
					//if(listData[i].lesson_gu != '01'){//수료제
						//var bClose = false;
						console.log("listData ::" , listData[i]);
						//logmes("listSet listData => " + listData[i]);
						/*if(listData[i].next_regi_able == 'EMPTY'){
							if (now >= total && daegi == 0){
	                            aTag = '<button class="block black">마감</button>'
								bClose = true;
							}
						}*/
						
						//if(!bClose){
						
						if(listData[i].next_regi_able == 'EMPTY'){
							if(listData[i].regi_degi == 'EMPTY'){		// 동일 강좌 대기 등록 여부 체크
								if(listData[i].suryo_degi == 'EMPTY'){	// 수료제 강좌 중 대기 등록된 동일 종목 체크
									if(listData[i].suryo_lesson == 'EMPTY' || listData[i].lesson_gu == '01' || up_id == '01' ){  // 수료제 강좌 중 수강 중인 동일 종목 체크
										 
										//if(daegi_regi >= group_deagi){
										if(able_regist_degi_cnt <= 0){	
											//console.log(able_regist_degi_cnt + "able_regist_degi_cnt");
											aTag = '<button class="block black">대기마감</button>'
										}
										else{
											//console.log(able_regist_degi_cnt + "able_regist_degi_cnt");
											aTag = '<button name="waitreg" class="block green waitreg">대기신청</button>'
										}
									}
									else{
										aTag = '<button onclick="javascript:alert(\'수강 및 예정인 수료제 프로그램이 있습니다..\');" class="block gray">신청불가</button>'
									}
								}
								else{
									aTag = '<button onclick="javascript:alert(\'대기 중인 수료제 프로그램이 있습니다..\');" class="block gray">신청불가</button>'
								}
							}
							else{
								//aTag = '<button name="waitcancel" class="block yellow waitcancel">대기취소</button>'
								aTag = '대기완료';
							}
	                    }
	                	else {
	                    	aTag = '<button onclick="javascript:alert(\'해당 프로그램은 이미 신청 되었습니다.\');" class="block black">신청완료</button>';
	                    }
					}
					else{ // 선착순접수
						if(listData[i].next_regi_able == 'EMPTY'){  // 다음달 동일 강좌 등록 여부 'EXIST' : 등록, 'EMPTY' : 미등록
							/*if ((now >= total && daegi > 0) || (re_register_mode == 'Y' && listData[i].u_price != "0")) {
								if(listData[i].already_regi == 'EMPTY'){
	                            	aTag = '<button name="dny" class="block yellow dny">대기등록</button>'
								}
								else{
									aTag = '<button onclick="javascript:alert(\'해당 종목의 프로그램은 이미 신청 되었습니다.\');" class="block black">신청불가</button>';
								}
	                        } else */if (now >= total && group_deagi == 0){
	                            aTag = '<button onclick="javascript:alert(\'해당 프로그램은 마감 되었습니다.\');" class="block black">마감</button>'
	                        } else if( real_dt != '0' &&  real_dt < getToday() ){
	                            aTag = '<button class="block gray">접수종료</button>';
	                        } else {
								if(listData[i].suryo_lesson == 'EMPTY' || listData[i].lesson_gu == '01'){
	                            	aTag = '<button name="acs" class="block blue selec">신청</button>';
								}
								else if( listData[i].lesson_gu == '03' || listData[i].reserved_gb == '01') {
	                            	aTag = '<button name="acs" class="block blue selec">신청</button>';
								}
								else{
									aTag = '<button onclick="javascript:alert(\'수강 및 예정인 수료제 프로그램이 있습니다..\');" class="block gray">신청불가</button>'
								}
	                        }
	                    } 
	                    // 이번달이 EMPTY든지 EXIST든지 수강중으로 처리
	                	else {
	                    	aTag = '<button onclick="javascript:alert(\'해당 프로그램은 이미 신청 되었습니다.\');" class="block black">신청완료</button>';
							//aTag = '수강예정';
	                    }
					}
                } else if( listData[i].able_type == 'disable' ){
                    aTag = '<button class="block gray">접수종료</button>';
                } else if(listData[i].able_type == undefined ){
                    aTag = '<button onclick="javascript:alert(\'해당 프로그램은 등록 기간설정이 되어있지 않아 신청이 불가합니다.\');" class="block gray">신청불가</button>';
                }

				if($("#logSession").val()==null || $("#logSession").val()=='') {
					aTag = '';	
				}
	                
                var pic_start_dt;
                var pic_start;
                var pic_end;
                var pic_end_dt;
				
				if (now > total) {
					now = Number(listData[i].group_rgl_qty);
					listData[i].group_regi_inwon = listData[i].group_rgl_qty
				}
				//if (listData[i].up_id == '03' && (listData[i].pgm_cd == '642222318' ||  listData[i].pgm_cd == '642222420' ||  listData[i].pgm_cd == '642222518' ||  listData[i].pgm_cd == '721234899' ||  listData[i].pgm_cd == '721234900' ||  listData[i].pgm_cd == '721234901')) {
				//	now = Number(listData[i].group_rgl_qty);
				//	aTag = '<button onclick="javascript:alert(\'해당 프로그램은 마감 되었습니다.\');" class="block black">마감</button>'
				//}
				var group_rgl_qty = listData[i].group_rgl_qty;
				//if ( listData[i].up_id == '02' && (listData[i].pgm_cd == '010005320' ||  listData[i].pgm_cd == '010005321' ||  listData[i].pgm_cd == '010005322')) {
				//	now = 35;
				//	group_rgl_qty = 35;
					//aTag = '<button onclick="javascript:alert(\'해당 프로그램은 마감 되었습니다.\');" class="block black">마감</button>'
				//}
			
                if (listData[i].real_st_dt == null || listData[i].real_st_dt == '') {
                    // pic_start_dt = year + '-' + numberPad(month + 1, 2) + '-' + '01';
                    pic_start = new Date(year , month , 1);
                    pic_start_dt = pic_start.getFullYear() + '-' + numberPad(pic_start.getMonth() + 1 , 2) + '-' + numberPad(pic_start.getDate(),2);
                    pic_end   = new Date(year, month + Number(listData[i].mm_qty), 0);
                    pic_end_dt = pic_end.getFullYear() + '-' + numberPad(pic_end.getMonth() + 1, 2) + '-' + pic_end.getDate();
                } else {
                    pic_start_dt = dateFormatter(listData[i].real_st_dt);
                    pic_end_dt = dateFormatter(listData[i].real_ed_dt);
                }
                var start_t = timeFormatter(listData[i].start_t);
                var end_t = timeFormatter(listData[i].end_t);
				var deagi_regi_inwon = listData[i].deagi_regi_inwon;

				if (able_regist_degi_cnt <= 0) {
					deagi_regi_inwon = listData[i].group_deagi_rgl_qty;
				}
				
			if (listData[i].up_id === '03') {	
				if(Number(deagi_regi_inwon)>=Number(listData[i].group_deagi_rgl_qty)) {
					deagi_regi_inwon = listData[i].group_deagi_rgl_qty;
					}
				}
				
			
                var html = '';
				var pgm_nm_gu = listData[i].pgm_nm;
				if(listData[i].lesson_gu == "02"){
					pgm_nm_gu = "[진도수료제]" + pgm_nm_gu;
				}
				else if(listData[i].lesson_gu == "03"){
					pgm_nm_gu = "[기간수료제]" + pgm_nm_gu;
				}
                html += '<tr ' 
				html +=  " data-course='" + JSON.stringify(listData[i])
				html += "' "
				html += ' >';
                html += '<td data-upid="'    + listData[i].up_id   + '">' + listData[i].up_nm + '</td>';						// 0
                html += '<td data-bas_cd="'  + listData[i].bas_cd  + '">' + listData[i].bas_nm + '</td>';						// 1
                html += '<td data-item_cd="' + listData[i].item_cd + '">' + listData[i].item_nm + '</td>';						// 2

				//html += '<td data-pgm_cd="'  + listData[i].pgm_cd  + '" onclick=selectPgmcd("'+listData[i].pgm_cd+'") >' + pgm_nm_gu + '</td>';                        // 3
                
				html += '<td style="cursor:pointer;" data-pgm_cd="'  + listData[i].pgm_cd  + '" >' + pgm_nm_gu + '</td>';		// 3

				html += '<td>' + start_t + " ~ " + end_t + '</td>';																// 4
                html += '<td data-target_cd="' + listData[i].target_cd + '">' + listData[i].target_nm + '</td>';				// 5
				//if( listData[i].lesson_gu == "03")
				//if(listData[i].reserved_gb == '02') // 대기제
				//{
                //	html += '<td>' + now + '/' + listData[i].deagi_rgl_qty + '</td>';											// 6
				//}
				//else{
					html += '<td>' + now + '/' + listData[i].group_rgl_qty + '</td>';											// 6
				//	html += '<td>' + now + '/' + group_rgl_qty + '</td>';											// 6
				//}
					html += '<td>' + deagi_regi_inwon + '/' + listData[i].group_deagi_rgl_qty + '</td>';											// 6
                html += '<td>' + monyReg(listData[i].u_price) + '원' + '</td>';													// 7
                //html += '<td><button name="detail_course" class="block green waitreg">상세</button></td>';
				html += '<td>' + aTag + '</td>';																				// 8
                // html += '<td>' + '<a href="" name="dtl" class="block white">보기</a>' + '</td>';                             // 9
                html += '<td style="display: none;" data-start_dt="' + pic_start_dt + '">' + pic_start_dt + '</td>'            	// 9
                html += '<td style="display: none;" data-last_end_dt="' + pic_end_dt + '">' + pic_end_dt + '</td>'            	// 10
                html += '<td style="display: none;">'+ listData[i].fg_cd + '</td>'                                            	// 11
				//html += '<td style="display: none;">'+ listData[i].deagi_judc_regi_inwon + '</td>'                                            	// 11
                html += '</tr>';
                tbody.append(html);
            }
        }
        pagingfunc(pageData, 'courseListAjax', 'pagination');
    }
}

// start_dt & last_end_dt 값 세팅 공통펑션
function numberPad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

// 페이징
function pagingfunc(data, funcnm, pagenm){

    var paging = '';
    if(data.prev == true) {
        paging += "<a href=\"javascript:"+funcnm+"(" + (data.startPage - 1) + "); \" title=\"이전 페이지\" class=\"direction prev\"><span>이전</span></a>";
    }
    for(var num=data.startPage; num <= data.endPage; num++) {
        paging += "<a href=\"javascript:"+funcnm+"(" + num + ");";
        if(data.cri.page == num) {
            paging += "\" class='active'";
        } else {
            paging += "\"";
        }
        paging += ">" + num;
        paging += "</a>";
    }
    if(data.next == true && data.endPage > 0) {
        paging += "<a href=\"javascript:"+funcnm+"(" + (data.endPage + 1) + "); \" title=\"다음 페이지\" class=\"direction next\"><span>다음</span></a>";
    }
    $("#"+pagenm).html(paging);
}

//접수기간 체크
function dteChk( param ) {
    var result = "F";
    $.ajax({
        url: '/dteChk.ajax' ,
        type: 'post',
        dataType: 'json',
        data: param,
        async:false,
        success : function(data, status, xhr) {
            if( data.data.resultCode != 'isnull') {
                var nowChk = data.data.regi_able;
				
				if (nowChk == "Y") {
				//	result = "false";
					result = "Y";		
				} else if (nowChk == "N") {
				//	result = "true";
					result = "N";
				} else {
					result = "F";
				}
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("dteChk error => " + error);
        }
    });
    return result;
}
//정원체크
function inwonChk( param ) {
    var result = false;
    $.ajax({
        url: '/selectRegiChk.ajax' ,
        type: 'post',
        dataType: 'json',
        data: param,
        async:false,
        success : function(data, status, xhr) {
            if( data.data.resultCode != 'isnull') {
                var nowChk = Number(data.data.group_regi_inwon);
                var totChk = Number(data.data.rgl_qty);

                result = nowChk >= totChk ? true : false;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("inwonChk error => " + error);
        }
    });
    return result;
}

// 시범운영 요구사항
function regiExistChk(){
    var result = true;

    $.ajax({
        type: 'post',
        url: '/regiExistChk.ajax',
        dataType: 'json',
        async:false,
        success : function(data, status, xhr) {
            if( data.data.resultCode == 'exist') {
                result = false;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			logmes("regiExistChk error => " + error);
        }
    });
    return result;
}

/*2022-06-17 태양 : sysopttb publicDc_gubun  조회 함수 */
function publicDc_gubun(){
	param ={};
	var up_id = $("#center option:checked").val();
	var result =true;
	//var ctxToday = year+""+numberPad(month,2)+""+numberPad(date,2)+""+numberPad(hours,2)+""+numberPad(minutes,2);
	//console.log("ctxToday ::", ctxToday);

	param.up_id = up_id;
	$.ajax({
		type: 'post',
		url: '/getPublicDc_gubun.ajax',
   		data: param,
   		dataType: 'json',
   		async:false,
		success : function(data, status, xhr) {
			console.log("/getPublicDc_gubun.ajax", data);
			var publicDcGubun = data.data.publicDc_gubun;
			//var from_date = data.data.from_date;
			//var to_date = data.data.to_date;
			
			if(publicDcGubun != "N") {
				if (data.data.able_type == "able") {
					result = false;
				//} else if (ctxToday-from_date>=0 && ctxToday-to_date<=0){
				//} else if (data.data.able_type == "disable"){
				//	result = false;
				} else {
					result = true;
				}
			}else{
				result = false;
			}
		},
		error : function(xhr, status, error) {
			console.log('error : ' + error);
			logmes("publicDc_gubun error => " + error);
		}
	});
	console.log("result ::", result);
	return result;
};

// 구분(컬럼) - 신청 클릭 ( 장바구니 넣기 )
$(document).on('click', '.selec', function (){
    if($("#logSession").val() == "") { // 세션이 비었음( 로그인 X )
        if ( confirm("수강 신청은 로그인 상태에서 할 수 있습니다.\r\n로그인 화면으로 이동하시겠습니까?") ) {
            location.href='/login.do';
        } else {
            return false;
        }
    } 
	else if ($("#logSession").val() != ""){ // 세션이 비어있지 않음 ( 수강신청 O )
		//memInfoSet(); // 로그인한 정보 
		
        //코드 들고 db갓다가,
        
        // if ( regiExistChk() ){ // 시범운영요구사항 끝나면 없앨 것.
        if ( true ) { // 시범운영 x

            // 장바구니 등록 처리
            var checkBtn = $(this);

            var tr = checkBtn.parent().parent();
            var td = tr.children();
            var up_id       = td.eq(0).data('upid');
            var bas_cd      = td.eq(1).data('bas_cd');
 			var item_cd      = td.eq(2).data('item_cd');
			var pgm_cd      = td.eq(3).data("pgm_cd");
            var target_cd   = td.eq(5).data("target_cd");
            var u_price     = td.eq(7).text().replace(/,/gi,'').replace('원','');
            var start_dt    = td.eq(10).text().replace(/-/gi,'');
            var last_end_dt = td.eq(11).text().replace(/-/gi,'');
			var fg_cd ="02";
			var param = {
                 "up_id"     : up_id
                ,"bas_cd"    : bas_cd				
                ,"pgm_cd"    : pgm_cd
                ,"target_cd" : target_cd
                ,"gubun" : "1"
				,"fg_cd" : fg_cd
            }

			if(up_id == "02") {
				param.item_cd = item_cd;
			}
			
			logmes("강좌 등록 클릭 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
			
			var dteChk_val = dteChk(param);
	        // if( dteChk(param) ){
	        if( dteChk_val == "N" ){
				logmes("접수기간오류(N) => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
				alert("해당 프로그램은 등록 기간이 아닙니다.");
 				return;
			} else if ( dteChk_val == "F" ){
				logmes("접수기간오류(F) => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
				alert("접속 지연이 발생하고 있으니 잠시 후 다시 시도해 주시기 바랍니다.");
 				return;
			}

			var regdisable = inwonChk(param);
			//regdisable = false
			
		//	if(param.up_id == "01" || param.up_id == "05" ) {  // 20230824 pkh 황새울국민체육센터 무기한 적용 제외 요청, 20231201 평생도 제외
		//	if(param.up_id == "05" ) {  // 20230824 pkh 황새울국민체육센터 무기한 적용 제외 요청, 20231201 평생도 제외  2024.06.17 황새울 적용
		//	} else {
				if(getpenaltycount(param.up_id, param.bas_cd, param.pgm_cd)){
					logmes("기간수료제 패널티 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					//alert('기간수료제 취소 후 3개월간 동일 종목 대기 접수가 제한 됩니다.');
			        return;
				}
		//	}
			
	        if( regdisable ){
				logmes("강좌 등록 정원초과 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
				var pgm_nm = td.eq(3).text();
	            alert(pgm_nm + " 의 정원이 초과되었습니다.");
 				return;
			}

           /* if ( upIdValidation(up_id) ){
				logmes("장바구니 업장 오류 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
                alert('장바구니에 담은 프로그램과 같은 업장의 프로그램을 선택해주세요.');
                return;
            }*/
			if(lessionFinishValidation(up_id, pgm_cd )){
				logmes("당월 수료 강좌1 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
				//alert('당월 수료되는 강좌로 수료 후 1개월간 신청할 수 없습니다.');
				//alert('당월 수료되는 강좌로 당월 신청할 수 없습니다.');
                return;
			}
			
			//if (tr.data("course").lesson_gu == '01') {
			if (param.up_id=="02" || param.up_id=="04") {
				if(getSeongnamFirstgroupduplication(up_id, bas_cd,item_cd,start_dt, last_end_dt, tr.data("course").pgm_group_cd)){
					logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('이미 수강중이거나 수강예정인 수료제 강습이 존재하거나, 장바구니 및 대기에 담긴 수료제강좌가 있어 신청할 수 없습니다.');
					return;
				}
				}
				else if (param.up_id=="03") {
					if(lessiontangroupduplication(up_id, bas_cd, start_dt, last_end_dt, tr.data("course").pgm_group_cd)){
					logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('동일 그룹으로 수강 등록 또는 장바구니에 담긴 강좌가 있어 신청할 수 없습니다.');
					return;
				}
				}
				else if (param.up_id=="06") {					
					if(lessionKggroupduplication(up_id, bas_cd, start_dt, last_end_dt, tr.data("course").pgm_group_cd)){
					logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('동일 그룹으로 수강 등록 또는 장바구니에 담긴 강좌가 있어 신청할 수 없습니다.');
					return;
					
						}
				}				
				else {
				if(lessiongroupduplication(up_id, bas_cd, start_dt, last_end_dt, tr.data("course").pgm_group_cd)){
					logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('동일 그룹으로 수강 등록 또는 장바구니에 담긴 강좌가 있어 신청할 수 없습니다.');
					return;
				}
			}
			
			//}
			/*
			if (tr.data("course").lesson_gu != '01') {
				if(lessionduplication(up_id, bas_cd, start_dt, last_end_dt )){
					logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('동일 종목으로 수강 등록 또는 장바구니에 담긴 강좌가 있어 신청할 수 없습니다.');
	                return;
				}
					
				if(lessioncount(up_id, start_dt, last_end_dt )){
					logmes("3강좌 이상 신청 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert('대기신청가능한 강좌수를 초과했습니다.');
	                return;
				}
			}*/
	            
            // ( #{user_id}, #{g_idx}, #{gubun}, #{target_cd}, #{pay_amt}, #{pay_sale},#{dc_cd}, now(),  1 ,#{start_dt} , #{last_end_dt} )
            var param = {};
            param.up_id       = up_id;
            param.pgm_cd      = pgm_cd;
            param.g_idx       = pgm_cd; // 주문
            param.target_cd   = target_cd;
            param.dc_cd       = '00001'; // 주문
            param.pay_amt     = u_price; // 주문
            param.pay_sale    = '0'; // 주문
            param.start_dt    = start_dt;
            param.last_end_dt = last_end_dt;
            param.gubun       = '1'; // 신규등록
			param.fg_cd       = '02'; // 신규등록
			param.bas_cd       = bas_cd; // 신규등록

            console.log(param); 

			// 업장별 간편자격조회 태울지말지 결정하기위한 tag값 조회 함수
			if (publicDc_gubun()){
				if(!checkPublicDC()) 
					return;
			}
			
			//황새울만 간편자격조회 거치는 로직
			
			/*if(param.up_id=="01"){
				if(!checkPublicDC()) return;
			}  
			*/
			//센터 모두 간편자격조회 거치는 로직
			//if(!checkPublicDC()) return;
			
            if( priceChk(param) ){
                /*
                    impossible == true : 하나만 금액이 있고 나머지는 금액이 없는 상태
                    possible == false  : 장바구니 0원, 담는 품목 0원  OR 모두 금액 있는 상태
                */
                alert('금액이 있는 상품과 금액이 없는 상품은 장바구니에 같이 담을 수 없습니다.');
                return false;
            }

            $.ajax({
                type: 'post',
//                url: '/cartInputAjax.ajax',
				url: '/cartInputAjaxCourseRegist.ajax',
                // == 장바구니 없앨 때 주문으로 바로 이동 ==
                // url: '/insertOrderCartItem.ajax',
                data: param,
                dataType: 'json',
                async: false,
                success : function(data, status, xhr) {
                    console.log(data);
					if (data.data.resultCode  == 'isBascdExist'){
						logmes("동일 종목 존재 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
						alert('이미 장바구니에 동일 종목 프로그램이 존재합니다.\r\n다시 선택해주세요.');
					}
					else{
	                    if ( data.data.resultCode  == 'targetFail' || 
                             data.data.resultCode  == 'isExist' || 
                             data.data.resultCode  == 'overFail'||
							 data.data.resultCode == 'isDraw' ){
	                        // alert(data.data.resultMessage);
	                        if( data.data.resultCode  == 'targetFail' ){
	                            alert('해당 프로그램이 연령에 맞지 않습니다. 다시 확인해주세요.');
	                        } else if( data.data.resultCode  == 'isExist' ) {
	                            alert('이미 장바구니에 존재하는 프로그램입니다.\r\n다시 선택해주세요.');
	                        } else if( data.data.resultCode  == 'overFail' ) {
	                            alert('정원이 초과되었습니다..');
	                        } else if( data.data.resultCode == 'isDraw' ) {
								alert(data.data.resultMessage);
								}
	                    } else {
	                        // 장바구니 CONFIRM 창
	                        if( confirm('수강신청 장바구니 목록에 담았습니다.\r\n 강좌보기를 그만두고 신청목록 장바구니로 가시겠습니까?') ){
	                            location.href = '/courseCart.do';
	                        }else{
	                            return false;
	                        }
	                    }
					}

                    // == 장바구니 없앨 때 주문으로 바로 이동 ==
                    // if (data.data.resultCode == 'isExist'){
                    //     alert('이미 주문하기 내역에 존재하는 프로그램입니다.\r\n다시 선택해주세요.');
                    // } else if (data.data.resultCode == 'isFail'){
                    //     alert('실패');
                    // } else if (data.data.resultCode == 'isSuccess'){
                    //     if( confirm('수강신청 주문하기 목록에 담았습니다.\r\n 강좌보기를 그만두고 신청목록 주문하기로 가시겠습니까?') ){
                    //         location.href = '/courseOrder.do';
                    //     }else{
                    //         return false;
                    //     }
                    // }

                },
                error : function(xhr, status, error) {
                    console.log('error : ' + error);
					logmes("장바구니 저장 오류 (error) => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
                    alert('해당 상품은 내부 데이터가 잘못된 상품이므로 신청할 수 없습니다.');
                }
            });
        }
		/* else {
            // alert('이미 신청한 강좌가 있거나 장바구니에 강좌가 존재합니다.\r\n 무료강좌는 하나만 신청 가능합니다.');
            alert('이미 신청한 강좌가 있거나 주문내역 강좌가 존재합니다.\r\n 무료강좌는 하나만 신청 가능합니다.');
        }*/
    }
});


function publicDc_hangkik(hangkikmem){

    var result = "false";

    $.ajax({
        async: true,
        type : 'POST',
        url : '/updateJudc.ajax',
        data : hangkikmem,
        dataType : 'json',
        beforeSend : function() {
            $('.wrap-loading').removeClass('display-none');
        },
        success : function(response, status, xhr) {
            $('.wrap-loading').addClass('display-none');
            if(response.data.resultCode == 'fail') {
                alert('관내거주여부 업데이트 실패');
                result = "false";
            }else if(response.data.resultCode == 'success') {
                result = "true";
            }
        },
        error : function(data, status, xhr) {
            console.log(JSON.stringify(data));
            $('.wrap-loading').addClass('display-none');
            result = "false";
        }
    });

    return result;
}
function fnFcBtn() {
	var obj = {};
	obj.idx = $('#mem_no').val();
	obj.sid = "1";
	obj.type = "user_info";
	//obj.name = $('#publicDc_Nm').val();
	obj.name = mem_nm_val;
	obj.ssn = $('#publicDc_reg1').val() + '' + $('#publicDc_reg2').val();

	if (mem_nm_val != $('#publicDc_Nm').val()) {
		//$('#publicDc_Nm').val(mem_nm_val);
		alert('데이터의 변형이 확인되어 자격조회 진행을 중단 합니다.');
		$("#publicDc_dialog").dialog("close");
		return false;
	}
	
	hangkik_check(obj);
			
    /*    $('.wrap-loading').removeClass('display-none');
        setTimeout(function(){
            $.ajax({
                type: "POST",
                url: 'https://sqi.isdc.co.kr/request_reduction.do',
                data: JSON.stringify(obj),
                dataType: 'json',
                //async: false,
                async: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Content-type","application/json");
                    xhr.setRequestHeader("API-KEY","RIDAUGBUWT83WGW8EGBW8AGB8T3W8GBW38GB3W8G");
                },
                success: function (response, status, xhr) {

                    $('.wrap-loading').addClass('display-none');
                    //console.log(response);
                    if(response.message == "response 성공"){

                        if(response.hangkikcode.substr(0,4) == '4113'){
                            response.hangkik_result = 'Y';
                        }else{
                            response.hangkik_result = 'N';
                        }

                        // 임시 테스트
                        //response.hangkik_result = 'Y';
                        //response.chldrn_result = '3';
                        //response.chldrn_birth = "20010204|20021124|20070824";
                        
                        // 다자녀의 경우 막내 나이가 18세 미만인 경우만 적용. 2021.03.15
						if(isTextEmpty(response.chldrn_result)){
							response.chldrn_result = 'N';
						} else {
							if(Number(response.chldrn_result)>2 && !isTextEmpty(response.chldrn_birth)){
								var arrYY = response.chldrn_birth.split('|');
								//var age = getAge(arrYY[arrYY.length-1]);
								var age = getAge(arrYY[arrYY.length]);
								
								if(Number(age) < 18) {
									response.chldrn_result = 'Y';
								} else {
									response.chldrn_result = 'N';
								}
								
							} else {
								response.chldrn_result = 'N';
							}
							
						}

						if(isTextEmpty(response.lowpollute_result)){
							response.lowpollute_result = 'N';
						}
						if(isTextEmpty(response.bscliv_result)){
							response.bscliv_result = 'N';
						}
						if(isTextEmpty(response.disabled_result)){
							response.disabled_result = 'N';
						}
						if(isTextEmpty(response.goodtax_result) || (response.goodtax_result != 'Y' && response.goodtax_result != 'N')){
							response.goodtax_result = 'N';
						}
						if(isTextEmpty(response.militarynoble_result)){
							response.militarynoble_result = 'N';
						}
						if(isTextEmpty(response.poor_result)){
							response.poor_result = 'N';
						}
						if(isTextEmpty(response.merit_result)){
							response.merit_result = 'N';
						}
						//차상위계층 풀리면 M으로 오는 거 N으로 표기 되도록 요청 20210226
						if(response.poor_result == 'M'){
							response.poor_result = 'N';
						}
					    //국가유공자는 정상값이 S로 넘어오기 때문에 Y로 변환 20210226
						if(response.merit_authority == 'Y' && response.merit_result == 'S'){
							response.merit_result = 'Y';
						} else {
							response.merit_result = 'N';
						}
                        
                        var tbody = $('#publicDcResult tbody');
                        tbody.empty();

                        tbody.append($('<tr>')
                            .append($('<td>', {text : response.bscliv_result}))
                            .append($('<td>', {text : response.chldrn_result}))
                            .append($('<td>', {text : response.disabled_result}))
                            //.append($('<td>', {text : response.goodtax_result}))
                            //.append($('<td>', {text : response.militarynoble_result}))
                            .append($('<td>', {text : response.poor_result}))
                            .append($('<td>', {text : response.merit_result}))
                            .append($('<td>', {text : response.hangkik_result})));

                        var hangkikmem = {};
                        hangkikmem.mem_no = response.idx;
                        hangkikmem.ju_dc = response.hangkik_result == "Y"? "1" : "2";
						hangkikmem.bscliv_result = response.bscliv_result;
						hangkikmem.chldrn_result = response.chldrn_result;
						hangkikmem.disabled_result = response.disabled_result;
						//hangkikmem.goodtax_result = response.goodtax_result;
						//hangkikmem.militarynoble_result = response.militarynoble_result;
						hangkikmem.merit_result = response.merit_result;
						hangkikmem.poor_result = response.poor_result;
						hangkikmem.lowpollute_result = response.lowpollute_result;
						hangkikmem.hangkik_result = response.hangkik_result == "Y"? "1" : "2";
                        //회원 정보 업데이트 (관내/관외)
                        publicDc_hangkik(hangkikmem);
                    }else{
                        alert(response.message);
                        console.log(response);
                    }
                },
                error: function (data, status, xhr) {
                    $('.wrap-loading').addClass('display-none');
                    console.log(JSON.stringify(data));
                    console.log(status + ' // ' + xhr);
                }
            });
        },0);*/
}

function PublicDCvalid(){
	var check_valid = true;
	var public_dc_dt = $("#public_dc_dt").val();
	var ju_dc = $("#ju_dc").val();
	
//	if(ju_dc == '9') return true; // 간편자격조회 무시
	
	if(public_dc_dt != null && public_dc_dt != undefined  && public_dc_dt != "")
	{
		var current_date = new Date();
		var apply_date = new Date(public_dc_dt);	
		var diff_time = current_date.getTime() -  apply_date.getTime();
		var diff_day = diff_time/(1000*60*60*24);
		if(diff_day > 365)
		{
			check_valid = false;
		} 
		logmes("public_dc_check not null => logSession : " +$("#logSession").val()+ ", diff_day : " + diff_day);
	}
	else{
		alert('간편자격 조회 정보가 없습니다. 간편자격조회를 하지 않을 경우 관외자로 분류 됩니다.');
		check_valid = false;
		logmes("public_dc_check null => logSession : " +$("#logSession").val()+ ", ju_dc : " + ju_dc);
	}
	
	return check_valid;
}

function checkPublicDC(){
//	var check_valid = true; 
	memInfoSet( );
//	var public_dc_dt = $("#public_dc_dt").val();
	var ju_dc = $("#ju_dc").val();
	
	if(ju_dc == '9') return true; // 간편자격조회 무시
	
/*	if(public_dc_dt != null && public_dc_dt != undefined  && public_dc_dt != "")
	{
		var current_date = new Date();
		var apply_date = new Date(public_dc_dt);	
		var diff_time = current_date.getTime() -  apply_date.getTime();
		var diff_day = diff_time/(1000*60*60*24);
		if(diff_day > 365)
		{
			check_valid = false;
		} 
		logmes("public_dc_check not null => logSession : " +$("#logSession").val()+ ", diff_day : " + diff_day);
	}
	else{
		alert('간편자격 조회 정보가 없습니다. 간편자격조회를 하지 않을 경우 관외자로 분류 됩니다.');
		check_valid = false;
		logmes("public_dc_check null => logSession : " +$("#logSession").val()+ ", ju_dc : " + ju_dc);
	}*/
	
		logmes("checkPublicDC => logSession : " +$("#logSession").val()+ ", ju_dc : " + ju_dc);
//	if(!check_valid)
	if(!PublicDCvalid)
	{
		if(confirm('간편자격 조회 정보가 없거나 1년이 경과하여\r\n먼저 [간편자격조회] 진행이 필요합니다. 진행하시겠습니까?'))
		{
			publicDC();
			return false;
		}
		else
		{
			return false;
		}
	} else {
		if(ju_dc == '')
		{
	        if(confirm('관내거주 여부를 체크하기 위해\r\n먼저 [간편자격조회] 진행이 필요합니다. 진행하시겠습니까?'))
			{
				publicDC();
				return false;
			}
			else
			{
				return false;
			}
		}
		else if(ju_dc != '1' && ju_dc != '9' ){
			if(confirm("관내 거주자만 신청할 수 있습니다.\r\n[간편자격조회]를 다시 진행하시겠습니까?'"))
			{
				publicDC();
				return false;
			}
			else{
				return false;
			}
		}
	}
	return true;
}
// 간편자격조회 버튼 눌렸을 때, 회원명 회원정보 SET
function memInfoSet( ){
	
    $.ajax({
        type : 'POST',
        url : '/memInfoUpdValSet.ajax',
        dataType : 'json',
        async:false,
        success : function(response, status, xhr) {
            $("#mem_no").val(response.data.mem_no);
            $("#mem_nm").val(response.data.mem_nm);
			mem_nm_val = response.data.mem_nm;
			if(response.data.ju_dc == '9') {
				$("#ju_dc").val(response.data.ju_dc);
			} else {
				$("#ju_dc").val(response.data.hangkik_result);
			}
			$("#public_dc_dt").val(response.data.pdc_apply_dt);
			$("#up_id").val(response.data.up_id)
			memInfo = response.data;
			console.log(memInfo);
            // html ='';
            // html += '<input type="hidden" id="mem_no" value="'+ response.data.mem_no+'">';
            // html += '<input type="hidden" id="mem_nm" value="'+ response.data.mem_nm+'">';
            // $("#container").append(html);
        },
        error : function(data, status, xhr) {
            console.log(JSON.stringify(data));
        }
    });
}
$(document).on('click', '#table_list_info tbody td', function (){
	var td = $(this);
	if(td[0].cellIndex != 3) return;
	var tr = $(this).parent();
    var data = tr.data('course');
	var param = {};
    param.up_id     = data.up_id;
    param.pgm_cd    = data.pgm_cd;
    $('#course_info').empty();
	$.ajax({
        type: 'post',
        url: '/courseInfo.ajax',
        data: param,
        dataType: 'json',
        beforeSend:function(){
            $('.wrap-loading').removeClass('display-none');
        },
        success : function(data, status, xhr) {
            $('.wrap-loading').addClass('display-none');
            console.log(data);
			var lesson_desc = data.data.lesson_desc;
			if(lesson_desc != undefined && lesson_desc.length > 50)
			{
				$('#course_info').html(lesson_desc);
	            var dlg = $("#class_detail_dialog");
			    dlg.dialog({
			        autoOpen:false,
			        width:600,
					minWidth : 600,
					height: 600,
					minHeight : 600,
			        position: { my: "center", at: "center", of: window },
			        modal:true,
			        resizable: false,
			    });
			    dlg.dialog("open");
			}
			else{
				alert("강좌 소개 정보가 없습니다.")
			}
        },
        error : function(xhr, status, error) {
			$('.wrap-loading').addClass('display-none');
			console.log('error : ' + error);
        }
    });
    
});

//간편조회 검색
$(document).on('click', '#publicDc_btn', function(){
    if ( confirm('비대면 간편 자격조회 서비스는\r\n' +
                 '조회시 최대 3분가량 소요될 수 있습니다.\r\n' +
                 '조회하시겠습니까?\r\n' +
                 '* 임산부, 군경할인은 현장방문(안내데스크)하여' +
                 '  증빙서류 제출자에 한하여 할인가능합니다.') ){
        fnFcBtn();
    }else{
        return false;
    }
});
//간편조회 API Dialog
function publicDC()
{
	window.scrollTo(0, 0);
    // 회원정보 가져옴
    memInfoSet( );
	var ju_dc = $("#ju_dc").val();

    var mem_nm = $("#mem_nm").val();

    $('#publicDc_Nm').val(mem_nm);

    var dlg = $("#publicDc_dialog");
    dlg.dialog({
        autoOpen:false,
        height: 450,
        width: 1000,
        position: { my: "center", at: "center", of: window },
        modal:true,
        resizable: false,
    });
	$('#agree_check').show();
	$('#publicDC').hide();
	$('#public_result').hide();
	$('#publicDc_confirm').hide();
	$('#agreement').prop('checked',false);
    dlg.dialog("open");
    $('#publicDc_reg1').focus();

}
$(document).on('click', '#class_detail_confirm', function(){
	$("#class_detail_dialog").dialog( "close" );
});
$(document).on('click', '#publicDc_confirm', function(){

    var pubDc = {};
    var tbody = $('#publicDcResult tbody tr');

    if(tbody.length < 1){ return; }

//    QUAL_RESULT = true; // 자격증명조회 YES

    var td = $('#publicDcResult tbody tr:first').children();

    pubDc.bscliv_result 		= td.eq(0).text();
    pubDc.chldrn_result 		= td.eq(1).text();
    pubDc.disabled_result 		= td.eq(2).text();
   //pubDc.goodtax_result 		= td.eq(3).text();
    //pubDc.militarynoble_result 	= td.eq(4).text();
    pubDc.poor_result 			= td.eq(3).text();
    pubDc.merit_result 			= td.eq(4).text();
    pubDc.hangkik_result 		= td.eq(5).text();

    $("#publicDc_dialog").dialog( "close" );

    var hangkik_result = td.eq(5).text();
	hangkik_YN = hangkik_result;
	 if(hangkik_YN == "N") {
		alert("관내 인원이 아니면 신청할 수 없습니다.");
    }
});

//수료제 대기 등록 취소
$(document).on('click', '.waitcancel', function (){
	if($("#logSession").val() == "") { // 세션이 비었음( 로그인 X )
        if (confirm("대기인원 신청은 로그인 상태에서 할 수 있습니다.\r\n로그인 화면으로 이동하시겠습니까?")) {
            location.href = '/login.do';
        } else {
            return false;
        }
    } 
	else {
        if( confirm('해당 프로그램의 대기신청이 취소됩니다.\r\n계속하시겠습니까?') ){
            var btn = $(this);
            var tr = btn.parent().parent();
            var td = tr.children();

            console.log(typeof td.eq(0).data('upid'));
            var param = {};
            param.up_id      = String( td.eq(0).data('upid') );
            param.bas_cd     = String( td.eq(1).data('bas_cd') );
            param.item_cd    = String( td.eq(2).data('item_cd') );
            param.pgm_cd     = String( td.eq(3).data('pgm_cd') );
            param.target_cd  = String( td.eq(5).data('target_cd') );
            param.fg_cd      = String( td.eq(12).text() );

            $.ajax({
                type: 'post',
                url: '/degiCancel.ajax',
                data: param,
                dataType: 'json',
                beforeSend:function(){
                    $('.wrap-loading').removeClass('display-none');
                },
                success : function(data, status, xhr) {
                    $('.wrap-loading').addClass('display-none');
                    console.log(data);
                    if( data.data.resultCode == 'success' ){
                        alert( ' 대기신청이 취소되었습니다.');
                    } else {
                        alert( ' 대기신청 취소가 실패했습니다.\r\n잠시 후 다시 시도해주세요. ' );
                    }
                },
                error : function(xhr, status, error) {
                    console.log('error : ' + error);
                }
            });
        } else {
            return false;
        }
    }
});

//수료제 대기 등록 대기신청
$(document).on('click', '.waitreg', function (){
	if($("#logSession").val() == "") { // 세션이 비었음( 로그인 X )
        if (confirm("대기인원 신청은 로그인 상태에서 할 수 있습니다.\r\n로그인 화면으로 이동하시겠습니까?")) {
            location.href = '/login.do';
        } else {
            return false;
        }
    } 
	else {
			var btn = $(this);
	        var tr = btn.parent().parent();
	        var td = tr.children();
			var course = tr.data("course");
	        console.log(typeof td.eq(0).data('upid'));
			console.log("course ::", course);
		
            var param = {};
            param.up_id      = String( td.eq(0).data('upid') );
            param.up_nm      = String( td.eq(0).text() );
            param.bas_cd     = String( td.eq(1).data('bas_cd') );
            param.item_cd    = String( td.eq(2).data('item_cd') );
            param.pgm_cd     = String( td.eq(3).data('pgm_cd') );
            param.pgm_nm     = String( tr.data('course').pgm_nm );
            param.target_cd  = String( td.eq(5).data('target_cd') );
            param.fg_cd      = String( td.eq(12).text() );
            param.start_dt      = String( td.eq(10).text() );
            param.last_end_dt      = String( td.eq(11).text() );
            param.gubun      = "3";
			param.lesson_gu  = course.lesson_gu;
			param.ju_dc = $("#ju_dc").val();
			param.pgm_group_cd = String(tr.data('course').pgm_group_cd);
			param.group_deagi_rgl_qty = String(tr.data('course').group_deagi_rgl_qty);			
		
			memInfoSet();
			
			/* 대기 등록 회원 체크를 위한 로그 추가 20220917 pkh */
			//if(course.leeson_gu !="01"){ // 수료제강좌 일경우 
			if(course.reserved_gb =="02"){ // 대기제 접수 
				console.log("memInfo ::", memInfo);
				logmes("대기정원 등록 클릭 => up_id : " + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
				
				var dteChk_val = dteChk(param);
		        // if( dteChk(param) ){
		        if( dteChk_val == "N" ){
					logmes("대기접수기간오류(N) => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert("해당 프로그램은 등록 기간이 아닙니다.");
	 				return;
				} else if ( dteChk_val == "F" ){
					logmes("대기접수기간오류(F) => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
					alert("접속 지연이 발생하고 있으니 잠시 후 다시 시도해 주시기 바랍니다.");
	 				return;
				}
				
				/*성남 관내 7 관외 3 */
				if (param.up_id=='02' || param.up_id=='03') {
					if(waitTotChk_judcin( param )) {
						 alert('대기정원이 초과되었습니다. ');
						logmes("대기정원 등록 클릭 => 대기정원이 초과 :" + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
		                return false;
					}
				}else {					
				
					if ( waitTotChk( param ) ) {
		                alert('대기정원이 초과되었습니다. ');
						logmes("대기정원 등록 클릭 => 대기정원이 초과 :" + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
		                return false;
	           		  }
				}
				if (tr.data("course").lesson_gu == '03') {
		            /*var today = new Date();
		            var year  = today.getFullYear(),
		                month = twoDigit( today.getMonth()+1 ),
		                date  = twoDigit( today.getDate() );
		            var now   = year+""+month+""+date;
					if(param.up_id == "01" && now < "20230820" ) {*/
					//if(param.up_id == "01" || param.up_id == "05" ) {  // 20230824 pkh 황새울국민체육센터 무기한 적용 제외 요청, 20231201 평생도 제외
					//} else {
						if(param.up_id !="02" && param.up_id !="04") {
						if(getpenaltycount(param.up_id, param.bas_cd, param.pgm_cd)){
							logmes("기간수료제 패널티 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
							//alert('기간수료제 취소 후 3개월간 동일 종목 대기 접수가 제한 됩니다.');
			                return;
						}
						}
						else {
							if(getSeongnampenaltycount(param.up_id, param.bas_cd,param.item_cd,param.pgm_cd)){
							logmes("기간수료제 패널티 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
							//alert('기간수료제 취소 후 3개월간 동일 종목 대기 접수가 제한 됩니다.');
			                return;													
						}
						}
					//}
				}
				if(lessionFinishValidation(param.up_id, param.pgm_cd )){
					//alert('당월 수료되는 강좌로 수료 후 1개월간 신청할 수 없습니다.');
					//alert('당월 수료되는 강좌로 당월 신청할 수 없습니다.');
					logmes("대기정원 등록 클릭2 => 수료강좌 이용 안내 : " + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
	                return false;
				}
				
				
				var pic_start = new Date(year , month , 1);
				if(pic_start.getMonth()==0) {
					var getmonth = pic_start.getMonth()+1;
					var du_start_dt = pic_start.getFullYear() + '' + numberPad(getmonth, 2) + '' + numberPad(pic_start.getDate(),2);
				}else {
                var du_start_dt = pic_start.getFullYear() + '' + numberPad(pic_start.getMonth(), 2) + '' + numberPad(pic_start.getDate(),2);
				}
			    if(param.up_id == "02" || param.up_id == "04") {
							if(getSeongnamlessionduplication(param.up_id, param.bas_cd,param.item_cd,du_start_dt, param.last_end_dt ))
						    {
								logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
								/*if (tr.data("course").lesson_gu == '01') {
									alert('동일 그룹으로 수강 등록(장바구니에 담긴)된 강좌가 있어 신청할 수 없습니다.');
								} else {*/
									alert('동일 종목으로 수강 등록(장바구니에 담긴)된 강좌가 있어 신청할 수 없습니다.');
								//}
					                return;
							}
				}else {
					if(param.up_id != "01") {
			                if(getlessionduplication(param.up_id, param.bas_cd, du_start_dt, param.last_end_dt ))
						    {
								logmes("동일 종목 강좌 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
								/*if (tr.data("course").lesson_gu == '01') {
									alert('동일 그룹으로 수강 등록(장바구니에 담긴)된 강좌가 있어 신청할 수 없습니다.');
								} else {*/
									alert('동일 종목으로 수강 등록(장바구니에 담긴)된 강좌가 있어 신청할 수 없습니다.');
								//}
					                return;
							}
					  }
			}
				if (tr.data("course").lesson_gu != '01') {
					if(degitcount(param.up_id, param.start_dt, param.last_end_dt )){
						logmes("3강좌 이상 신청 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
						alert('대기신청가능한 강좌수를 초과했습니다.');
		                return;
					}
				}
				
//	memInfoSet( );
//	var ju_dc = $("#ju_dc").val();
	
//	if(ju_dc == '9') return true; // 간편자격조회 무시
	
//	if(!PublicDCvalid) {
				if((memInfo.hangkik_result == "2" || memInfo.ju_dc == "2" || memInfo.ju_dc == '' || !memInfo.hangkik_result) && memInfo.ju_dc != "9"){ //관외 일경우 
					if(!confirm('해당 프로그램의 대기인원으로 등록됩니다.\r\n등록하시겠습니까?\r\n'+memInfo.mem_nm+ '님 : 성남시민 회원 아님 \r\n ※ 성남시민이신 경우 마이페이지 > 간편자격조회에서 조회하셔서 성남시민 확인 후, 신청하기 바랍니다. \r\n ※ 수강신청 전 관내,관외 여부를 반드시 확인하시기 바랍니다. \r\n ※ 관외로 접수한 경우, 이후 관내 인증을 하더라도 자동으로 변경되지 않습니다. \r\n (위 경우 대기접수 취소 후 다시 접수하셔야 합니다.)')){
						logmes("대기정원 등록 클릭 => 관외 회원 대기인원 등록 : " + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
						return false;
					}
				}else if((memInfo.hangkik_result == "1" && memInfo.ju_dc =="1") || (memInfo.ju_dc == "9")){
					if(!confirm('해당 프로그램의 대기인원으로 등록됩니다.\r\n등록하시겠습니까? \r\n\r\n ※ 수강신청 전 관내,관외 여부를 반드시 확인하시기 바랍니다. \r\n\r\n ※ 관외로 접수한 경우, 이후 관내 인증을 하더라도 자동으로 변경되지 않습니다. \r\n\r\n (위 경우 대기접수 취소 후 다시 접수하셔야 합니다.)')){ //관내 일경우 
						logmes("대기정원 등록 클릭 => 관내 회원 대기인원 등록 : " + param.up_id + ", mem_no : " + memInfo.mem_no + ", pgm_cd : " + param.pgm_cd);
						return false;
					}
				}
//			}
				
/*
				2022.05.24 pty 황새울에서도 대기신청시 그냥 접수 받는다고 함 
				if(param.up_id == "01"){
					if(!checkPublicDC()) return;	
				}*/
				
	            $.ajax({
	                type: 'post',
	                url: '/regRespn.ajax',
	                data: param,
	                dataType: 'json',
	                beforeSend:function(){
	                    $('.wrap-loading').removeClass('display-none');
	                },
	                success : function(data, status, xhr) {
	                    $('.wrap-loading').addClass('display-none');
	                    console.log(data);
	                    if( data.data.resultCode == 'success' ){
	                        alert( '대기인원으로 등록되었습니다. ');
							location.href = 'https://spo.isdc.co.kr/myCourseList.do#tabs-2';

							getSmsCallback(param);
						    courseListAjax( 0 );
	                    }else if( data.data.resultCode == 'exist' ){
	                        alert(' 이미 동일 강좌의 대기인원으로 등록된 회원입니다. ');
	                    }else if( data.data.resultCode == 'bascd_exist' ){
	                        alert(' 이미 동일 종목의 대기인원으로 등록된 회원입니다. ');
	                    } else if( data.data.resultCode == 'targetFail' ){
	                        alert('해당 프로그램이 연령에 맞지 않습니다. 다시 확인해주세요.');
                        } else if( data.data.resultCode  == 'overFail' ) {                            
							alert('대기정원이 초과되었습니다..');
	                    } else {
	                        alert('대기인원 등록이 실패했습니다.\r\n잠시 후 다시 시도해주세요. ' );
	                    }
						logmes("대기정원 등록 결과 => up_id : " + param.up_id + ", mem_no : " + memInfo.mem_no + ", resultCode : " + data.data.resultCode);
	                },
	                error : function(xhr, status, error) {
	                    console.log('error : ' + error);
	                }
	            });
        	} else {
            	return false;
       		}
    }
});

function twoDigit( data ){
    if ( Number(data) < 10 ) { data = "0"+data; }
    return data;
}

function getSmsCallback(data) {
	var ju_dc = $("#ju_dc").val();
	var ju_cd_nm;
	if ( (  ju_dc == '1' || ju_dc == '9')  ) {
		ju_cd_nm = "관내"
	} else {
		ju_cd_nm = "관외"
	}
	
	var param = {};
//                out.println("param.user_id       = 'WEB';");
    param.schedule_type = '0';
    param.subject       = '대기인원 등록 완료';
    param.sms_msg       = data.up_nm + '의 ' + data.pgm_nm + ' ' + ju_cd_nm + ' 강좌 대기 등록 되었습니다.';
    param.dest_type     = '0';
    param.dest_count    = '1';
    param.dest_info     = memInfo.mem_no + '^'+ memInfo.h_tel_no;
    param.send_status   = '0';
    param.send_count    = '0';
    param.send_result   = '0';

    if( data.up_id == "01" ){
    	param.cdr_id    = 'kmcenter01';
        param.callback      = '0317279900'
    }else if( data.up_id == "02" ){
        param.cdr_id    = 'isdc7396700';
        param.callback      = '0317396711';
    }else if( data.up_id == "03" ){       //탄천 up_id 03
        param.cdr_id    = 'tancheon01';
        param.callback      = '0317257100';
    }else if( data.up_id == "04" ){       //판교 : isdccokr
        param.cdr_id    = 'isdccokr';
        param.callback      = '0317244660';
    }else if( data.up_id == "05" ){		//평생
        param.cdr_id    = 'simc1073';
        param.callback      = '0317811073';
    }else if( data.up_id == "06" ){		//금곡
        param.cdr_id    = 'kmcenter03';
        param.callback      = '0317279990';
    }

	$.ajax({
//		async: true,
		type : 'POST',
		url : '/sendSMS.ajax',
        async:false,
        data:param,
		dataType : 'json',
		beforeSend : function() {
			$('.wrap-loading').removeClass('display-none');
		},
		success : function( data, status, xhr) {
		},
		error : function(data, status, xhr) {
			console.log('error : ' + error);
		}
	});
}

// 정원초과 버튼 클릭 팝업
$(document).on('click', '.dny', function (){
    if($("#logSession").val() == "") { // 세션이 비었음( 로그인 X )
        if (confirm("대기인원 신청은 로그인 상태에서 할 수 있습니다.\r\n로그인 화면으로 이동하시겠습니까?")) {
            location.href = '/login.do';
        } else {
            return false;
        }
    } else {
        if( re_register_mode == 'Y' || (re_register_mode == 'N' && confirm('해당 프로그램의 정원이 초과되었습니다. 대기인원으로 등록됩니다.\r\n등록하시겠습니까?')) ){
            var btn = $(this);
            var tr = btn.parent().parent();
            var td = tr.children();
			var course = tr.data('course');

            console.log(typeof td.eq(0).data('upid'));
            var param = {};
            param.up_id      = String( td.eq(0).data('upid') );
            param.up_nm      = String( td.eq(0).text() );
            param.bas_cd     = String( td.eq(1).data('bas_cd') );
            param.item_cd    = String( td.eq(2).data('item_cd') );
            param.pgm_cd     = String( td.eq(3).data('pgm_cd') );
            param.pgm_nm     = String( tr.data('course').pgm_nm );
            param.target_cd  = String( td.eq(5).data('target_cd') );
            param.fg_cd      = String( td.eq(12).text() );
			param.lesson_gu  = course.lesson_gu;
			var check_reghis = true;
			if(re_register_mode == 'Y')
			{
				if(check_register_mode == 'Y')
				{
					check_reghis = false;
					var my_param = {};
			        my_param.up_id = param.up_id;
			        my_param.start_dt = '20210101';
			        my_param.end_dt = '20210131';
					
			        $.ajax({
			            type: 'post',
			            url: '/mySimpleCourseList.ajax',
			            data: my_param,
			            dataType: 'json',
						async: false,
			            beforeSend:function(){
			                $('.wrap-loading').removeClass('display-none');
			            },
			            success : function(data, status, xhr) {
			                $('.wrap-loading').addClass('display-none');
			                console.log( data );
							var list = data.data;
	                		if( list.resultCode == 'isnull' ){
								alert('수강 이력이 없습니다.');
								return false;
							}
							for(var i=0; i<list.length; i++) {
								if(list[i].bas_cd == param.bas_cd)
								{
									check_reghis = true;
									break;
								}
							};
							if(!check_reghis)
			                {
								alert('동일 대분류의 강좌를 수강한 이력이 없습니다.');
								return false;
							}
			            },
			            error : function(xhr, status, error) {
			                console.log('error : ' + error);
			            }
			        });
				}
			}
	        else{
				if ( waitTotChk( param ) ) {
	                alert('대기정원이 초과되었습니다... ');
	                return false;
	            }
				if(lessionFinishValidation(param.up_id, param.pgm_cd )){
					//alert('당월 수료되는 강좌로 수료 후 1개월간 신청할 수 없습니다.');
				logmes("당월 수료 강좌3 => up_id : " + param.up_id + ", logSession : " +$("#logSession").val()+ ", pgm_cd : " + param.pgm_cd);
	                return false;
				}
			}
			if(!check_reghis)
			{
				return false;
			}
			// 2022.04.27 해당 체크 확인필요
			//if(!checkPublicDC()) return;
			
            $.ajax({
                type: 'post',
                url: '/regRespn.ajax',
                data: param,
                dataType: 'json',
                beforeSend:function(){
                    $('.wrap-loading').removeClass('display-none');
                },
                success : function(data, status, xhr) {
                    $('.wrap-loading').addClass('display-none');
                    console.log(data);
                    if( data.data.resultCode == 'success' ){
                        alert( ' 대기인원으로 등록되었습니다. ');
						getSmsCallback(param);
                    }else if( data.data.resultCode == 'exist' ){
                        alert(' 이미 동일 강좌의 대기인원으로 등록된 회원입니다. ');
                    }else if( data.data.resultCode == 'bascd_exist' ){
                        alert(' 이미 동일 종목의 대기인원으로 등록된 회원입니다. ');
                    } else if( data.data.resultCode == 'targetFail' ){
                        alert('해당 프로그램이 연령에 맞지 않습니다. 다시 확인해주세요.');
                    } else {
                        alert( ' 대기인원 등록이 실패했습니다.\r\n잠시 후 다시 시도해주세요. ' );
                    }
                },
                error : function(xhr, status, error) {
                    console.log('error : ' + error);
                }
            });
        } else {
            return false;
        }
    }
});

/*
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
}*/

function waitTotChk( param ){
    var result = false;
    $.ajax({
        type: 'post',
        url: '/selectWaitTot.ajax',
        data: param,
        async:false,
        dataType: 'json',
        success : function(data, status, xhr) {
            if( data.data.resultCode == 'possible' ){
                result = false;
            }else{
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function waitTotChk_judcin( param ){
    var result = false;
    $.ajax({
        type: 'post',
        url: '/selectWaitTotJudcIn.ajax',
        data: param,
        async:false,
        dataType: 'json',
        success : function(data, status, xhr) {
            if( data.data.resultCode == 'possible' ){
                result = false;
            }else{
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

// 리셋버튼
$("#reset").on('click',function (){
    $(".table_list_info > tbody").empty(); // 티바티
    $("#pagination").empty();              // 페이징

    $("#center option:eq(0)").prop('selected',true);    //체육센터
    $("#event option:eq(0)").prop('selected',true);     //대분류
    $("#class option:eq(0)").prop('selected',true);     //소분류
    $("#target option:eq(0)").prop('selected',true);    //대상명
    $("#pgm_nm").val('');                            //강좌명
    $("#lerturer_name").val('');                     //강사명

    $("input:checkbox[name='weekname']").prop('chechked',false);    //체크박스
    //라벨 액티브클래스 해제
    $("label[for='weekname_1']").removeClass('active');
    $("label[for='weekname_2']").removeClass('active');
    $("label[for='weekname_3']").removeClass('active');
    $("label[for='weekname_4']").removeClass('active');
    $("label[for='weekname_5']").removeClass('active');
    $("label[for='weekname_6']").removeClass('active');
    $("label[for='weekname_7']").removeClass('active');
});

function lessionFinishValidation(upid, pgm_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.pgm_cd = pgm_cd;

    $.ajax({
        type: 'post',
        url: '/getlessionFinishStatus.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            logmes("lessionfinish:"+param.up_id+":"+param.pgm_cd+":"+$("#logSession").val()+":"+data.data.resultCode);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
				alert('당월 수료되는 강좌로 당월 신청할 수 없습니다.');
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			// alert('로그인 세션이 종료 되었습니다. 로그인 후 다시 신청해 주시기 바랍니다.');
			alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        }
    });
    return result;
}

function getlessionduplication(upid, bas_cd, start_dt, last_end_dt){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');

    $.ajax({
        type: 'post',
        url: '/lessionduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function getSeongnamlessionduplication(upid, bas_cd,item_cd,start_dt,last_end_dt){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');
	param.item_cd = item_cd;

    $.ajax({
        type: 'post',
        url: '/lessionSeongnamduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function getSeongnamFirstgroupduplication(upid, bas_cd, item_cd, start_dt, last_end_dt,pgm_group_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');
	param.item_cd = item_cd;
	param.pgm_group_cd = pgm_group_cd;
    $.ajax({
        type: 'post',
        url: '/lessionSeongnamFirstduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function lessiongroupduplication(upid, bas_cd, start_dt, last_end_dt, pgm_group_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');
	param.pgm_group_cd = pgm_group_cd;

    $.ajax({
        type: 'post',
        url: '/lessiongroupduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function lessiontangroupduplication(upid, bas_cd, start_dt, last_end_dt, pgm_group_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');
	param.pgm_group_cd = pgm_group_cd;

    $.ajax({
        type: 'post',
        url: '/lessiontangroupduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function lessionKggroupduplication(upid, bas_cd, start_dt, last_end_dt, pgm_group_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');
	param.pgm_group_cd = pgm_group_cd;

    $.ajax({
        type: 'post',
        url: '/lessionKggroupduplication.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function lessioncount(upid, start_dt, last_end_dt){
    var result = true;
    var param = {};
    param.up_id = upid;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');

    $.ajax({
        type: 'post',
        url: '/lessioncount.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode < 3 || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function getpenaltycount(upid, bas_cd, pgm_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
	param.pgm_cd = pgm_cd;

    $.ajax({
        type: 'post',
        url: '/penaltycount.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
				alert('회원님은 ' + data.result.start_dt + '부터 ' + data.result.end_dt + '까지 사용이 정지 되었습니다.\r\n이후에 이용하시기 바랍니다.');
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			// alert('로그인 세션이 종료 되었습니다. 로그인 후 다시 신청해 주시기 바랍니다.');
			alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        }
    });
    return result;
}

function getSeongnampenaltycount(upid, bas_cd, item_cd, pgm_cd){
    var result = true;
    var param = {};
    param.up_id = upid;
	param.bas_cd = bas_cd;
	param.pgm_cd = pgm_cd;	
	param.item_cd = item_cd;

    $.ajax({
        type: 'post',
        url: '/penaltycount.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'N' || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
				alert('회원님은 ' + data.result.start_dt + '부터 ' + data.result.end_dt + '까지 사용이 정지 되었습니다.\r\n이후에 이용하시기 바랍니다.');
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
			// alert('로그인 세션이 종료 되었습니다. 로그인 후 다시 신청해 주시기 바랍니다.');
			alert('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.');
        }
    });
    return result;
}

function degitcount(upid, start_dt, last_end_dt){
    var result = true;
    var param = {};
    param.up_id = upid;
    param.start_dt = start_dt.replace(/-/gi, '');
	param.last_end_dt = last_end_dt.replace(/-/gi, '');

    $.ajax({
        type: 'post',
        url: '/degitcount.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode < 3 || data.data.resultCode == 'isnull' ){
                result = false;
            } else {
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}

function upIdValidation(upid){
    var result = true;
    var param = {};
    param.up_id = upid;

    $.ajax({
        type: 'post',
        url: '/getOrderUpid.ajax',
        data: param,
        dataType: 'json',
        async : false,
        // beforeSend:function(){
        //     $('.wrap-loading').removeClass('display-none');
        // },
        success : function(data, status, xhr) {
            console.log(data);
            // $('.wrap-loading').addClass('display-none');
            if( data.data.resultCode == 'same' || data.data.resultCode == 'isnull' ){
                result = false;
            } else if( data.data.resultCode == 'dif' ){
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
    return result;
}
function getToday(){
    return year +""+ (month<10? "0"+month : month) +""+ (date<10? "0"+date : date);
}
// 장바구니 품목 담기 전 금액 체크
function priceChk(param){
    var result='';
   $.ajax({
        type: 'post',
        url: '/priceChk.ajax',
        data: param,
        // data: {'pay_amt':'0'},
        dataType: 'json',
        async:false,
        success : function(data, status, xhr) {
            console.log( data.data );
            if( data.data == 'possible' ){
                result = false;
            } else if( data.data == 'impossible' ){
                result = true;
            }
        },
        error : function(xhr, status, error) {
            console.log('error : ' + error);
        }
    });
   return result;
}
function isTextEmpty(str){
    if(typeof str == "undefined" || str == null || str == "")
        return true;
    else
        return false ;
}

function getAge(yyyy) { // 간편자격조회 다자녀 막내 나이체크
	var today = new Date();
	var birthDay = new Date(yyyy.substr(0,4), 0, 1);
	var age = today.getFullYear() - birthDay.getFullYear() + 1;
	
	return age;
}