terraform {
  required_version = "= 1.2.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 4.31.0"
    }
  }

  backend "s3" {
    bucket = "chrislewis-tfstate"
    key    = "terraform-ecs-fargate-service-test"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

module "infrastructure" {
  source = "github.com/c-d-lewis/terraform-modules//ecs-fargate-service?ref=master"

  region           = "us-east-1"
  service_name     = "node-microservices"
  container_cpu    = 512
  container_memory = 1024
  ecr_name         = "node-microservices-ecr"
  cluster_name     = "node-microservices-cluster"
  port             = 5959
  vpc_id           = "vpc-c3b70bb9"
  certificate_arn  = "arn:aws:acm:us-east-1:617929423658:certificate/a69e6906-579e-431d-9e4c-707877d325b7"
  route53_zone_id  = "Z05682866H59A0KFT8S"
  route53_domain_name = "chrislewis.me.uk"
}

output "dns_address" {
  value = module.infrastructure.service_dns
}
