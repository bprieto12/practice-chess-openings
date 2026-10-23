terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # State is kept locally in infra/terraform.tfstate (gitignored). Back it up:
  # without it, Terraform loses track of these resources.
}

# us-east-1 for everything: CloudFront only accepts ACM certificates from this region.
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "practice-chess-openings"
      ManagedBy = "terraform"
    }
  }
}
