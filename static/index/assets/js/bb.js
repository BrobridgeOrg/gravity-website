$(document).ready(function (){
	$("#startuse-click").click(function (){
		$('html, body').animate({
			scrollTop: $("#start-use").offset().top
		}, 100);
	});
});

const ctrl = new ScrollMagic.Controller();
const tlStart = new TimelineMax();
tlStart.to("#arrow-start", 1, {top:90});

new ScrollMagic.Scene({
	triggerElement: "#stage-start",
	duration: "50%",
	triggerHook: 0.25
})
.setTween(tlStart)
.addTo(ctrl);

const tlIssue = new TimelineMax();
tlIssue.staggerFrom(".g-issues", 1.5, {
	scale: 0,
	stagger: {
		from: "center",
		amount: 0.75
	}
});

new ScrollMagic.Scene({
	triggerElement: "#stage-issue",
	duration: "20%",
	triggerHook: 0.25
})
.setTween(tlIssue)
.addTo(ctrl);

new ScrollMagic.Scene({
		triggerElement: "#bg-issue",
	})
	.setClassToggle("#bg-issue", "bg-light") // add class toggle
	.addTo(ctrl);

new ScrollMagic.Scene({
		triggerElement: "#title-issue"
	})
	.on("enter leave", function (e) {
		if (e.type == 'enter') $('#titleBox-issue').removeClass( "d-none" )
		if (e.type == 'leave') $('#titleBox-issue').addClass( "d-none" )
	})
	.setClassToggle(".title-issue", "animate__backInRight") // add class toggle
	.addTo(ctrl);

new ScrollMagic.Scene({
		triggerElement: "#title-topic"
	})
	.on("enter leave", function (e) {
		if (e.type == 'enter') $('#titleBox-topic').removeClass( "d-none" )
		if (e.type == 'leave') $('#titleBox-topic').addClass( "d-none" )
	})
	.setClassToggle(".title-topic", "animate__bounceInDown") // add class toggle
	.addTo(ctrl);

const tlTopic = new TimelineMax();
tlTopic.to(".topic-img", 1, {width:"100%"});

new ScrollMagic.Scene({
	triggerElement: "#cover-topic",
	duration: "60%",
	triggerHook: 0.25
})
.setTween(tlTopic)
.addTo(ctrl);
